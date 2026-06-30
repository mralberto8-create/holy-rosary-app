import { useState, useEffect, useRef, useCallback } from "react";
import {
  onAuthStateChanged, GoogleAuthProvider, signInWithPopup,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut as fbSignOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

const LS = {
  novena:   "novena_54day",
  progress: "rosary_progress",
  favorites: "pieta_favorites",
};

function readLocalAll() {
  let progress = null, favorites = [];
  try { progress = JSON.parse(localStorage.getItem(LS.progress)); } catch {}
  try { favorites = JSON.parse(localStorage.getItem(LS.favorites)) || []; } catch {}
  return {
    novenaStartDate: localStorage.getItem(LS.novena) || null,
    rosaryProgress:  progress,
    pietaFavorites:  favorites,
  };
}

function applyToLocal({ novenaStartDate, rosaryProgress, pietaFavorites }) {
  if (novenaStartDate !== undefined) {
    novenaStartDate
      ? localStorage.setItem(LS.novena, novenaStartDate)
      : localStorage.removeItem(LS.novena);
  }
  if (rosaryProgress !== undefined) {
    rosaryProgress
      ? localStorage.setItem(LS.progress, JSON.stringify(rosaryProgress))
      : localStorage.removeItem(LS.progress);
  }
  if (pietaFavorites !== undefined) {
    localStorage.setItem(LS.favorites, JSON.stringify(pietaFavorites));
  }
}

async function pushToCloud(uid, fields) {
  try {
    await setDoc(
      doc(db, "users", uid, "state", "v1"),
      { ...fields, updatedAt: serverTimestamp() },
      { merge: true }
    );
  } catch {}
  // Firestore SDK queues the write offline and replays when reconnected
}

export function useUserSync() {
  const local = readLocalAll();
  const [user,            setUser]            = useState(null);
  const [authLoading,     setAuthLoading]     = useState(true);
  const [novenaStartDate, _setNovena]         = useState(local.novenaStartDate);
  const [rosaryProgress,  _setProgress]       = useState(local.rosaryProgress);
  const [pietaFavorites,  _setFavorites]      = useState(local.pietaFavorites);
  const [showSignIn,      setShowSignIn]      = useState(false);
  const [authError,       setAuthError]       = useState(null);

  // Refs to compare incoming Firestore values without stale closures
  const novenaRef   = useRef(local.novenaStartDate);
  const progressRef = useRef(local.rosaryProgress);
  const favsRef     = useRef(local.pietaFavorites);

  function applyCloud(cloud) {
    const n = cloud.novenaStartDate  ?? null;
    const p = cloud.rosaryProgress   ?? null;
    const f = cloud.pietaFavorites   ?? [];
    const nStr = JSON.stringify(n);
    const pStr = JSON.stringify(p);
    const fStr = JSON.stringify(f);
    if (nStr !== JSON.stringify(novenaRef.current))   { novenaRef.current = n;   _setNovena(n);    applyToLocal({ novenaStartDate: n }); }
    if (pStr !== JSON.stringify(progressRef.current)) { progressRef.current = p; _setProgress(p);  applyToLocal({ rosaryProgress: p }); }
    if (fStr !== JSON.stringify(favsRef.current))     { favsRef.current = f;     _setFavorites(f); applyToLocal({ pietaFavorites: f }); }
  }

  useEffect(() => {
    let unsubSnapshot = null;

    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (unsubSnapshot) { unsubSnapshot(); unsubSnapshot = null; }
      setUser(fbUser);
      setAuthLoading(false);

      if (!fbUser) return;

      // On sign-in: pull cloud state; if no cloud doc yet, migrate local data up
      const ref = doc(db, "users", fbUser.uid, "state", "v1");
      const snap = await getDoc(ref).catch(() => null);
      if (snap && snap.exists()) {
        const cloud = snap.data();
        const local = {
          novenaStartDate: novenaRef.current,
          rosaryProgress:  progressRef.current,
          pietaFavorites:  favsRef.current,
        };
        // Merge: prefer whichever side has actual data (avoids wiping local on first sign-in from empty-cloud device)
        const merged = {
          novenaStartDate: cloud.novenaStartDate ?? local.novenaStartDate,
          rosaryProgress:  cloud.rosaryProgress  ?? local.rosaryProgress,
          pietaFavorites:  (cloud.pietaFavorites && cloud.pietaFavorites.length)
                             ? cloud.pietaFavorites
                             : (local.pietaFavorites && local.pietaFavorites.length)
                               ? local.pietaFavorites
                               : [],
        };
        applyCloud(merged);
        await pushToCloud(fbUser.uid, merged);
      } else {
        await pushToCloud(fbUser.uid, {
          novenaStartDate: novenaRef.current,
          rosaryProgress:  progressRef.current,
          pietaFavorites:  favsRef.current,
        });
      }

      // Subscribe for real-time cross-device updates
      unsubSnapshot = onSnapshot(ref, (snap) => {
        if (snap.exists()) applyCloud(snap.data());
      });
    });

    return () => {
      unsubAuth();
      if (unsubSnapshot) unsubSnapshot();
    };
  }, []);
  const saveNovena = useCallback((value) => {
    novenaRef.current = value;
    _setNovena(value);
    applyToLocal({ novenaStartDate: value });
    if (auth.currentUser) pushToCloud(auth.currentUser.uid, { novenaStartDate: value });
  }, []);

  const saveRosaryProgress = useCallback((value) => {
    progressRef.current = value;
    _setProgress(value);
    applyToLocal({ rosaryProgress: value });
    if (auth.currentUser) pushToCloud(auth.currentUser.uid, { rosaryProgress: value });
  }, []);

  const savePietaFavorites = useCallback((value) => {
    favsRef.current = value;
    _setFavorites(value);
    applyToLocal({ pietaFavorites: value });
    if (auth.currentUser) pushToCloud(auth.currentUser.uid, { pietaFavorites: value });
  }, []);

  const signInGoogle = useCallback(async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      setShowSignIn(false);
    } catch (e) {
      if (e.code !== "auth/popup-closed-by-user")
        setAuthError("Sign in failed. Please try again.");
    }
  }, []);

  const signInEmail = useCallback(async (email, password, isNew) => {
    setAuthError(null);
    try {
      if (isNew) await createUserWithEmailAndPassword(auth, email, password);
      else       await signInWithEmailAndPassword(auth, email, password);
      setShowSignIn(false);
    } catch (e) {
      const msgs = {
        "auth/email-already-in-use": "That email is already registered. Try signing in.",
        "auth/user-not-found":       "No account found with that email.",
        "auth/wrong-password":       "Incorrect password.",
        "auth/invalid-login-credentials": "Incorrect email or password.",
        "auth/invalid-email":        "Please enter a valid email address.",
        "auth/weak-password":        "Password must be at least 6 characters.",
      };
      setAuthError(msgs[e.code] || "Something went wrong. Please try again.");
    }
  }, []);

  const signOut = useCallback(async () => {
    await fbSignOut(auth);
  }, []);

  return {
    user, authLoading,
    showSignIn, setShowSignIn,
    authError, setAuthError,
    novenaStartDate, saveNovena,
    rosaryProgress,  saveRosaryProgress,
    pietaFavorites,  savePietaFavorites,
    signInGoogle, signInEmail, signOut,
  };
}
