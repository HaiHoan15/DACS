import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import api from "../../../API/api";

function parseQrPayload(rawValue) {
  if (!rawValue || typeof rawValue !== "string") {
    return { rawValue, code: "", roomName: "" };
  }

  const parts = rawValue.split("|");
  const roomIdPart = parts.find((part) => part.startsWith("ROOM_ID="));
  const roomPart = parts.find((part) => part.startsWith("ROOM="));
  const userIdPart = parts.find((part) => part.startsWith("USER_ID="));
  const userPart = parts.find((part) => part.startsWith("USER="));
  const emailPart = parts.find((part) => part.startsWith("EMAIL="));
  const codePart = parts.find((part) => part.startsWith("CODE="));

  return {
    rawValue,
    roomId: roomIdPart ? Number(roomIdPart.replace("ROOM_ID=", "")) : 0,
    roomName: roomPart ? roomPart.replace("ROOM=", "") : "",
    userId: userIdPart ? Number(userIdPart.replace("USER_ID=", "")) : 0,
    username: userPart ? decodeURIComponent(userPart.replace("USER=", "")) : "",
    email: emailPart ? decodeURIComponent(emailPart.replace("EMAIL=", "")) : "",
    code: codePart ? codePart.replace("CODE=", "") : "",
  };
}

export default function MemberConfirmationManagement() {
  const scannerRef = useRef(null);
  const scannerElementId = "member-confirmation-qr-reader";

  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");

  const stopScanning = async () => {
    if (!scannerRef.current) {
      setIsScanning(false);
      return;
    }

    try {
      await scannerRef.current.stop();
    } catch {
      // Scanner may already be stopped.
    }

    try {
      await scannerRef.current.clear();
    } catch {
      // Ignore clear errors.
    }

    scannerRef.current = null;
    setIsScanning(false);
  };

  const startScanning = async () => {
    try {
      setScanError("");
      setScanResult(null);
      setConfirmMessage("");

      if (!navigator?.mediaDevices?.getUserMedia) {
        setScanError("Thiết bị/trình duyệt không hỗ trợ camera.");
        return;
      }

      if (scannerRef.current) {
        await stopScanning();
      }

      const scanner = new Html5Qrcode(scannerElementId, { verbose: false });
      scannerRef.current = scanner;

      setIsScanning(true);

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          const parsed = parseQrPayload(decodedText || "");
          setScanResult(parsed);
          void stopScanning();
        },
        () => {
          // Ignore per-frame decode failures.
        }
      );
    } catch {
      setScanError("Không thể mở camera. Vui lòng kiểm tra quyền truy cập camera trên trình duyệt.");
      await stopScanning();
    }
  };

  useEffect(() => {
    return () => {
      void stopScanning();
    };
  }, []);

  const handleConfirmMember = async () => {
    if (!scanResult) return;

    const adminUser = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("authToken") || "temp-token";

    setConfirming(true);
    setConfirmMessage("");
    try {
      const response = await api.post(
        "MemberConfirmationController.php",
        {
          action: "confirm",
          confirmationCode: scanResult.code || scanResult.rawValue,
          roomId: scanResult.roomId,
          roomName: scanResult.roomName,
          userId: scanResult.userId,
          username: scanResult.username,
          email: scanResult.email,
          adminId: adminUser?.id || 0,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setConfirmMessage(response.data.message || "Xác nhận thành viên thành công");
      } else {
        setConfirmMessage(response.data.message || "Xác nhận thất bại");
      }
    } catch (error) {
      setConfirmMessage(error.response?.data?.message || "Lỗi kết nối server khi xác nhận");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Xác nhận thành viên</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Quét mã QR từ phía user để xác nhận thành viên vào phòng tập.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Camera quét mã</h2>
            <div className="flex gap-2">
              {!isScanning ? (
                <button
                  type="button"
                  onClick={() => {
                    void startScanning();
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Quét mã
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    void stopScanning();
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Dừng quét
                </button>
              )}
            </div>
          </div>

          <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-black relative min-h-[360px]">
            <div id={scannerElementId} className="w-full h-[360px]" />
            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm">
                Nhấn "Quét mã" để mở camera
              </div>
            )}
          </div>

          {scanError && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">{scanError}</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Kết quả quét</h2>

          {scanResult ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-700 p-4">
                <p className="text-sm text-green-700 dark:text-green-300 font-semibold">Quét mã thành công</p>
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">Tên user:</span> {scanResult.username || "Không xác định"}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">Gmail:</span> {scanResult.email || "Không xác định"}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">Phòng:</span> {scanResult.roomName || "Không xác định"}
                </p>
                <p className="text-gray-600 dark:text-gray-300 break-all">
                  <span className="font-semibold">Mã:</span> {scanResult.code || scanResult.rawValue}
                </p>
              </div>

              <button
                type="button"
                onClick={handleConfirmMember}
                disabled={confirming}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
              >
                {confirming ? "Đang xác nhận..." : "Xác nhận thành viên"}
              </button>
              {confirmMessage && (
                <p className="text-sm text-blue-600 dark:text-blue-300">{confirmMessage}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Dữ liệu xác nhận sẽ được lưu vào lịch sử hoạt động thành viên.
              </p>
            </div>
          ) : (
            <div className="h-[220px] flex items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 text-sm">
              Chưa có dữ liệu quét.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}