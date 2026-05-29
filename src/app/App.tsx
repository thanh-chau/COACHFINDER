import { type ReactNode, useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router";
import { getCurrentUser } from "./api/auth";
import { HomePage } from "./pages/HomePage";
import { AuthPage } from "./pages/AuthPage";
import { LearnerDashboard } from "./pages/LearnerDashboard";
import { CoachDashboard } from "./pages/CoachDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { CoachProfileSetupPage } from "./pages/CoachProfileSetupPage";
import type { ApiRole } from "./types/auth";
import {
  AUTH_SESSION_EXPIRED_EVENT,
  clearAuthSession,
  getAccessToken,
  getDashboardPath,
  updateAuthSession,
} from "./utils/authSession";
import { Toaster, toast } from "sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";
import {
  useNotificationWebSocket,
  useVideoCallWebSocket,
} from "./api/websocket";
import { VideoCallModal } from "./components/VideoCallModal";

const GOOGLE_CLIENT_ID =
  "798255039135-0o8kh6bhfq33qkjehg87d8q7uav28tf7.apps.googleusercontent.com";

type SessionState =
  | { status: "checking" }
  | { status: "guest" }
  | { status: "ready"; role: ApiRole };

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
      Đang kiểm tra phiên đăng nhập...
    </div>
  );
}

function useSessionRestore() {
  const [state, setState] = useState<SessionState>(() =>
    getAccessToken() ? { status: "checking" } : { status: "guest" },
  );

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!getAccessToken()) {
        setState({ status: "guest" });
        return;
      }

      setState({ status: "checking" });
      try {
        const user = await getCurrentUser();
        if (user.active === false) {
          throw new Error("Inactive account");
        }

        updateAuthSession({
          userId: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatarUrl ?? undefined,
        });

        if (!cancelled) {
          setState({ status: "ready", role: user.role });
        }
      } catch {
        clearAuthSession();
        if (!cancelled) {
          setState({ status: "guest" });
        }
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

function ProtectedRoute({
  expectedRole,
  children,
}: {
  expectedRole: ApiRole;
  children: ReactNode;
}) {
  const location = useLocation();
  const state = useSessionRestore();

  if (state.status === "checking") {
    return <LoadingScreen />;
  }

  if (state.status === "guest") {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  if (state.role !== expectedRole) {
    return <Navigate to={getDashboardPath(state.role)} replace />;
  }

  return children;
}

function AuthRoute({ children }: { children: ReactNode }) {
  const state = useSessionRestore();

  if (state.status === "checking") {
    return <LoadingScreen />;
  }

  if (state.status === "ready") {
    return <Navigate to={getDashboardPath(state.role)} replace />;
  }

  return children;
}

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function handleExpiredSession() {
      if (
        location.pathname.startsWith("/dashboard") ||
        location.pathname.startsWith("/coach/profile")
      ) {
        navigate("/auth", { replace: true });
      }
    }

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleExpiredSession);
    return () =>
      window.removeEventListener(
        AUTH_SESSION_EXPIRED_EVENT,
        handleExpiredSession,
      );
  }, [location.pathname, navigate]);

  useNotificationWebSocket((notif) => {
    toast.success(notif.title + ": " + notif.message, {
      duration: 5000,
      icon: "🔔",
      style: {
        border: "1px solid #FF8A00",
        padding: "16px",
        color: "#333",
      },
    });
  });

  const [incomingCall, setIncomingCall] = useState<{
    callerUsername: string;
  } | null>(null);
  const [activeCall, setActiveCall] = useState<{
    targetUsername: string;
    isCaller: boolean;
  } | null>(null);

  useVideoCallWebSocket((signal) => {
    if (signal.type === "call" && signal.senderUsername) {
      // Show incoming call
      setIncomingCall({ callerUsername: signal.senderUsername });
    } else if (signal.type === "end") {
      setIncomingCall(null);
      setActiveCall(null);
    }
  });

  const acceptCall = () => {
    if (incomingCall) {
      setActiveCall({
        targetUsername: incomingCall.callerUsername,
        isCaller: false,
      });
      setIncomingCall(null);
    }
  };

  const rejectCall = () => {
    if (incomingCall) {
      // send end signal
      import("./api/websocket").then(({ chatWebSocketService }) => {
        chatWebSocketService.sendCallSignal({
          type: "end",
          targetUsername: incomingCall.callerUsername,
        });
      });
      setIncomingCall(null);
    }
  };

  return (
    <>
      {incomingCall && !activeCall && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-white p-4 rounded-2xl shadow-xl shadow-orange-500/20 border-2 border-orange-500 flex items-center gap-4 animate-bounce">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-2xl">📞</span>
          </div>
          <div>
            <p className="font-bold text-gray-900">
              {incomingCall.callerUsername} đang gọi video...
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={acceptCall}
                className="px-4 py-1.5 bg-green-500 text-white rounded-lg text-sm font-bold"
              >
                Nghe
              </button>
              <button
                onClick={rejectCall}
                className="px-4 py-1.5 bg-red-500 text-white rounded-lg text-sm font-bold"
              >
                Từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {activeCall && (
        <VideoCallModal
          targetUsername={activeCall.targetUsername}
          isCaller={activeCall.isCaller}
          onClose={() => setActiveCall(null)}
        />
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/auth"
          element={
            <AuthRoute>
              <AuthPage />
            </AuthRoute>
          }
        />
        <Route
          path="/dashboard/learner"
          element={
            <ProtectedRoute expectedRole="TRAINEES">
              <LearnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/coach"
          element={
            <ProtectedRoute expectedRole="COACHES">
              <CoachDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coach/profile/setup"
          element={
            <ProtectedRoute expectedRole="COACHES">
              <CoachProfileSetupPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute expectedRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={<Navigate to="/dashboard/admin" replace />}
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Toaster position="top-right" />
        <AppRoutes />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
