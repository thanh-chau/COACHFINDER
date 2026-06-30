import { useEffect, useState } from "react";
import { Building2, CheckCircle2, PauseCircle, RefreshCw, XCircle } from "lucide-react";
import { toast } from "sonner";
import { getAdminGyms, updateAdminGymStatus } from "../api/gymOwner";
import type { GymProfile, GymProfileStatus } from "../types/gymOwner";

const statusLabels: Record<GymProfileStatus, string> = {
  PENDING: "Cho duyet",
  APPROVED: "Da duyet",
  REJECTED: "Tu choi",
  SUSPENDED: "Tam dung",
};

export function AdminGyms() {
  const [rows, setRows] = useState<GymProfile[]>([]);
  const [status, setStatus] = useState<GymProfileStatus | "all">("all");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setRows(await getAdminGyms(status));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Khong tai duoc danh sach phong tap");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [status]);

  const updateStatus = async (id: number, next: GymProfileStatus) => {
    try {
      await updateAdminGymStatus(id, next);
      toast.success("Da cap nhat trang thai phong tap");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Cap nhat trang thai that bai");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-lg font-extrabold text-gray-900">
            <Building2 className="h-5 w-5 text-emerald-500" />
            Phong tap doi tac
          </div>
          <p className="mt-1 text-sm text-gray-500">Duyet chu phong tap va quan ly trang thai payout doi tac.</p>
        </div>
        <div className="flex gap-2">
          <select value={status} onChange={(event) => setStatus(event.target.value as GymProfileStatus | "all")} className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none">
            <option value="all">Tat ca trang thai</option>
            <option value="PENDING">Cho duyet</option>
            <option value="APPROVED">Da duyet</option>
            <option value="REJECTED">Tu choi</option>
            <option value="SUSPENDED">Tam dung</option>
          </select>
          <button onClick={() => void load()} className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3">Phong tap</th>
                <th className="px-5 py-3">Chu so huu</th>
                <th className="px-5 py-3">Lien he</th>
                <th className="px-5 py-3">Trang thai</th>
                <th className="px-5 py-3 text-right">Thao tac</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((gym) => (
                <tr key={gym.id} className="border-t border-gray-100">
                  <td className="px-5 py-4">
                    <div className="font-bold text-gray-900">{gym.name}</div>
                    <div className="text-gray-500">{gym.address || "-"}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-gray-800">{gym.ownerName || "-"}</div>
                    <div className="text-gray-500">{gym.ownerEmail || "-"}</div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{gym.hotline || "-"}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">{statusLabels[gym.status]}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => updateStatus(gym.id, "APPROVED")} className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50" title="Duyet">
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => updateStatus(gym.id, "SUSPENDED")} className="rounded-lg p-2 text-amber-600 hover:bg-amber-50" title="Tam dung">
                        <PauseCircle className="h-4 w-4" />
                      </button>
                      <button onClick={() => updateStatus(gym.id, "REJECTED")} className="rounded-lg p-2 text-red-600 hover:bg-red-50" title="Tu choi">
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                    {loading ? "Dang tai..." : "Chua co phong tap doi tac."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
