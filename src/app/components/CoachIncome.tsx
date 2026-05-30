import { useEffect, useState } from "react";
import {
  DollarSign, TrendingUp, TrendingDown, ArrowUpRight,
  Calendar, Clock, Download, Search, Filter,
  CheckCircle2, XCircle, AlertCircle, ChevronDown,
  Wallet, CreditCard, Banknote, ReceiptText,
  Users, Star, Award, Zap, Info,
  ArrowDown, RefreshCw, ChevronRight, Package,
  ShieldCheck, BadgePercent, ChevronUp,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from "recharts";
import { coachWorkspaceApi } from "../api/coachWorkspace";
import type { CoachIncomeOverview, CoachTopStudent } from "../types/coachWorkspace";
import type { WalletTransaction } from "../types/wallet";
import { WalletPanel } from "./WalletPanel";

// ─── Avatars ──────────────────────────────────────────────────────────────────
const AVT = {
  a: "https://images.unsplash.com/photo-1607286908165-b8b6a2874fc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=80",
  b: "https://images.unsplash.com/photo-1755549476788-efd8bf819561?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=80",
  c: "https://images.unsplash.com/photo-1660463527860-b66aebd362c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=80",
};

// ─── Data ────────────────────────────────────────────────────────────────────
const MONTHLY_DATA = [
  { month:"T4/25",  gross:8500000,  net:7480000,  sessions:18, students:9  },
  { month:"T5/25",  gross:9200000,  net:8096000,  sessions:20, students:10 },
  { month:"T6/25",  gross:8900000,  net:7832000,  sessions:19, students:10 },
  { month:"T7/25",  gross:10500000, net:9240000,  sessions:23, students:12 },
  { month:"T8/25",  gross:11200000, net:9856000,  sessions:24, students:13 },
  { month:"T9/25",  gross:9800000,  net:8624000,  sessions:21, students:12 },
  { month:"T10/25", gross:9800000,  net:8624000,  sessions:21, students:11 },
  { month:"T11/25", gross:11200000, net:9856000,  sessions:24, students:13 },
  { month:"T12/25", gross:14500000, net:12760000, sessions:31, students:16 },
  { month:"T1/26",  gross:12300000, net:10824000, sessions:26, students:14 },
  { month:"T2/26",  gross:13800000, net:12144000, sessions:30, students:15 },
  { month:"T3/26",  gross:17727273, net:15600000, sessions:35, students:17 },
];

const SOURCE_DATA = [
  { name:"Buổi lẻ",      value:5600000,  color:"#3b82f6", pct:36 },
  { name:"Gói 8 buổi",   value:4200000,  color:"#8b5cf6", pct:27 },
  { name:"Gói tháng",    value:3800000,  color:"#10b981", pct:24 },
  { name:"Gói 3 tháng",  value:2000000,  color:"#f59e0b", pct:13 },
];

type TxStatus = "paid" | "pending" | "refunded";
interface Tx {
  id: string; date: string; student: string; avatar: string;
  type: string; package: string; gross: number; commission: number; net: number;
  status: TxStatus; method: string; note?: string;
}

const TRANSACTIONS: Tx[] = [
  { id:"tx001", date:"05/03/2026", student:"Võ Thị Hoa",       avatar:AVT.a, type:"Buổi lẻ",    package:"Buổi tập Thể hình",   gross:454545, commission:54545, net:400000, status:"paid",    method:"MoMo" },
  { id:"tx002", date:"05/03/2026", student:"Trần Bảo Long",    avatar:AVT.b, type:"Buổi lẻ",    package:"Buổi tập Thể hình",   gross:454545, commission:54545, net:400000, status:"paid",    method:"VNPAY" },
  { id:"tx003", date:"04/03/2026", student:"Nguyễn Minh Anh",  avatar:AVT.a, type:"Gói 8 buổi", package:"Thể hình 8 buổi",     gross:3636364,commission:436364,net:3200000,status:"paid",    method:"Chuyển khoản" },
  { id:"tx004", date:"04/03/2026", student:"Đặng Quốc Tuấn",   avatar:AVT.b, type:"Buổi lẻ",    package:"Buổi tập Thể hình",   gross:454545, commission:54545, net:400000, status:"paid",    method:"MoMo" },
  { id:"tx005", date:"03/03/2026", student:"Lê Thúy Nga",      avatar:AVT.c, type:"Gói tháng",  package:"Thể hình tháng 3",    gross:4318182,commission:518182,net:3800000,status:"paid",    method:"VNPAY" },
  { id:"tx006", date:"03/03/2026", student:"Phạm Đức Hải",     avatar:AVT.a, type:"Buổi lẻ",    package:"Buổi tập Boxing",     gross:454545, commission:54545, net:400000, status:"pending", method:"MoMo", note:"Chờ xác nhận" },
  { id:"tx007", date:"02/03/2026", student:"Bùi Văn Nam",      avatar:AVT.b, type:"Gói 8 buổi", package:"Cardio 8 buổi",       gross:3636364,commission:436364,net:3200000,status:"paid",    method:"Chuyển khoản" },
  { id:"tx008", date:"01/03/2026", student:"Võ Thị Hoa",       avatar:AVT.a, type:"Gói tháng",  package:"Yoga tháng 3",        gross:4318182,commission:518182,net:3800000,status:"paid",    method:"MoMo" },
  { id:"tx009", date:"28/02/2026", student:"Nguyễn Minh Anh",  avatar:AVT.a, type:"Gói 3 tháng",package:"Thể hình Q1",         gross:11363636,commission:1363636,net:10000000,status:"paid", method:"Chuyển khoản" },
  { id:"tx010", date:"27/02/2026", student:"Trần Bảo Long",    avatar:AVT.b, type:"Buổi lẻ",    package:"Buổi tập Thể hình",   gross:454545, commission:54545, net:400000, status:"paid",    method:"VNPAY" },
  { id:"tx011", date:"26/02/2026", student:"Lê Thúy Nga",      avatar:AVT.c, type:"Buổi lẻ",    package:"Buổi tập Yoga",       gross:454545, commission:54545, net:400000, status:"paid",    method:"MoMo" },
  { id:"tx012", date:"25/02/2026", student:"Đặng Quốc Tuấn",   avatar:AVT.b, type:"Gói 8 buổi", package:"Chạy bộ 8 buổi",     gross:3636364,commission:436364,net:3200000,status:"refunded",method:"Chuyển khoản", note:"Học viên hủy" },
  { id:"tx013", date:"24/02/2026", student:"Phạm Đức Hải",     avatar:AVT.a, type:"Buổi lẻ",    package:"Buổi tập Boxing",     gross:454545, commission:54545, net:400000, status:"pending", method:"MoMo" },
  { id:"tx014", date:"23/02/2026", student:"Bùi Văn Nam",      avatar:AVT.b, type:"Gói tháng",  package:"Cardio tháng 2",      gross:4318182,commission:518182,net:3800000,status:"paid",    method:"VNPAY" },
  { id:"tx015", date:"22/02/2026", student:"Võ Thị Hoa",       avatar:AVT.a, type:"Buổi lẻ",    package:"Buổi tập Yoga",       gross:454545, commission:54545, net:400000, status:"paid",    method:"MoMo" },
];

const TOP_STUDENTS = [
  { name:"Nguyễn Minh Anh", avatar:AVT.a, revenue:13200000, sessions:26, pkg:"Gói 3 tháng", rating:5.0 },
  { name:"Võ Thị Hoa",      avatar:AVT.a, revenue:8200000,  sessions:22, pkg:"Gói tháng",   rating:4.9 },
  { name:"Bùi Văn Nam",     avatar:AVT.b, revenue:7000000,  sessions:18, pkg:"Gói 8 buổi",  rating:4.8 },
  { name:"Trần Bảo Long",   avatar:AVT.b, revenue:4400000,  sessions:12, pkg:"Buổi lẻ",     rating:4.7 },
  { name:"Lê Thúy Nga",     avatar:AVT.c, revenue:4200000,  sessions:11, pkg:"Gói tháng",   rating:5.0 },
];

const PAYOUTS = [
  { date:"01/03/2026", amount:12144000, status:"done",    method:"VCB ****8819", ref:"PO-20260301" },
  { date:"01/02/2026", amount:10824000, status:"done",    method:"VCB ****8819", ref:"PO-20260201" },
  { date:"01/01/2026", amount:12760000, status:"done",    method:"VCB ****8819", ref:"PO-20260101" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n:number) => n.toLocaleString("vi-VN") + "đ";
const fmtM = (n:number) => n>=1000000 ? (n/1000000).toFixed(1)+"M" : (n/1000).toFixed(0)+"K";

const STATUS_CFG: Record<TxStatus,{ label:string; bg:string; text:string; icon:any }> = {
  paid:     { label:"Đã nhận",   bg:"bg-emerald-50", text:"text-emerald-600", icon:CheckCircle2 },
  pending:  { label:"Chờ xử lý", bg:"bg-amber-50",   text:"text-amber-600",   icon:AlertCircle },
  refunded: { label:"Hoàn tiền", bg:"bg-red-50",     text:"text-red-500",     icon:XCircle },
};

const COMMISSION_RATE = 0.12;

function StatusBadge({ status }:{ status:TxStatus }) {
  const c = STATUS_CFG[status];
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg ${c.bg} ${c.text}`}
      style={{fontSize:"0.65rem",fontWeight:700}}>
      <Icon className="w-2.5 h-2.5"/>{c.label}
    </span>
  );
}

// ─── Custom Tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }:any) {
  if (!active||!payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2.5 min-w-32">
      <div style={{fontWeight:700,fontSize:"0.78rem"}} className="text-gray-700 mb-1.5">{label}</div>
      {payload.map((p:any)=>(
        <div key={p.dataKey} className="flex items-center justify-between gap-3">
          <span style={{fontSize:"0.7rem"}} className="text-gray-400">{p.name}</span>
          <span style={{fontSize:"0.75rem",fontWeight:700}} className="text-gray-800">{fmtM(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({
  monthlyData = MONTHLY_DATA,
  topStudents = TOP_STUDENTS,
  transactions = [],
}: {
  monthlyData?: MonthlyIncomeRow[];
  topStudents?: TopStudentRow[];
  transactions?: Tx[];
}) {
  const [period,setPeriod] = useState<"6m"|"12m">("12m");
  const data = period==="6m" ? monthlyData.slice(-6) : monthlyData;
  const curMonth = monthlyData[monthlyData.length-1] || { gross: 0, net: 0, sessions: 0, students: 0, month: "N/A" };
  const prevMonth = monthlyData[monthlyData.length-2] || curMonth;
  
  const rawMonthStr = curMonth.month || "";
  let displayMonth = "T" + (new Date().getMonth() + 1);
  if (rawMonthStr.includes("-")) {
    const parts = rawMonthStr.split("-");
    if (parts.length >= 2) displayMonth = "T" + parseInt(parts[1], 10);
  } else if (rawMonthStr.includes("/")) {
    displayMonth = rawMonthStr.split("/")[0];
  }

  const growthGross = prevMonth.gross === 0 
    ? (curMonth.gross > 0 ? "100.0" : "0.0") 
    : ((curMonth.gross - prevMonth.gross) / prevMonth.gross * 100).toFixed(1);
  const growthNet = prevMonth.net === 0 
    ? (curMonth.net > 0 ? "100.0" : "0.0") 
    : ((curMonth.net - prevMonth.net) / prevMonth.net * 100).toFixed(1);

  const pieData = (() => {
    if (!transactions || transactions.length === 0) return [];
    const map: Record<string, number> = {};
    let total = 0;
    transactions.forEach(t => {
      if (t.status === "paid") {
        map[t.type] = (map[t.type] || 0) + t.gross;
        total += t.gross;
      }
    });
    if (total === 0) return [];
    const colors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#f43f5e"];
    return Object.keys(map).map((k, i) => ({
      name: k,
      value: map[k],
      color: colors[i % colors.length],
      pct: Math.round((map[k] / total) * 100)
    })).sort((a, b) => b.value - a.value);
  })();

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon:Banknote,    label:`Doanh thu ${displayMonth}`,        value:fmtM(curMonth.gross),  sub:"Trước hoa hồng",       trend:`+${growthGross}%`, trendUp:true,  bg:"bg-blue-50",   color:"text-blue-500"   },
          { icon:DollarSign,  label:`Thu nhập thực ${displayMonth}`,    value:fmtM(curMonth.net),    sub:"Sau HH 12%",           trend:`+${growthNet}%`,   trendUp:true,  bg:"bg-emerald-50",color:"text-emerald-500"},
          { icon:Calendar,    label:`Buổi dạy ${displayMonth}`,         value:curMonth.sessions+"",  sub:`${curMonth.students} học viên`, trend:"+5",   trendUp:true,  bg:"bg-purple-50", color:"text-purple-500" },
          { icon:BadgePercent,label:"Hoa hồng nền tảng",  value:"12%",                sub:"Pro Coach plan",        trend:"Elite: 0%",        trendUp:false, bg:"bg-amber-50",  color:"text-amber-500"  },
        ].map(({icon:Icon,label,value,sub,trend,trendUp,bg,color})=>(
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`}/>
              </div>
              <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${trendUp?"bg-emerald-50 text-emerald-600":"bg-gray-100 text-gray-500"}`}
                style={{fontSize:"0.63rem",fontWeight:700}}>
                {trendUp?<TrendingUp className="w-2.5 h-2.5"/>:<ArrowUpRight className="w-2.5 h-2.5"/>}{trend}
              </span>
            </div>
            <div style={{fontWeight:800,fontSize:"1.3rem",lineHeight:1}} className="text-gray-900 mb-0.5">{value}</div>
            <div style={{fontWeight:600,fontSize:"0.78rem"}} className="text-gray-700 mb-0.5">{label}</div>
            <div style={{fontSize:"0.7rem"}} className="text-gray-400">{sub}</div>
          </div>
        ))}
      </div>

      {/* Revenue Area Chart */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <div style={{fontWeight:700,fontSize:"0.95rem"}} className="text-gray-900">Biểu đồ doanh thu</div>
            <div style={{fontSize:"0.75rem"}} className="text-gray-400">Doanh thu trước & sau hoa hồng 12%</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-400/40 border-2 border-blue-500"/><span style={{fontSize:"0.72rem"}} className="text-gray-500">Doanh thu gộp</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-400/40 border-2 border-emerald-500"/><span style={{fontSize:"0.72rem"}} className="text-gray-500">Thu nhập thực</span></div>
            </div>
            <div className="flex bg-gray-100 rounded-xl p-0.5 gap-0.5">
              {(["6m","12m"] as const).map(p=>(
                <button key={p} onClick={()=>setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${period===p?"bg-white text-gray-800 shadow-sm":"text-gray-400"}`}
                  style={{fontSize:"0.75rem",fontWeight:period===p?700:500}}>{p==="6m"?"6 tháng":"12 tháng"}
                </button>
              ))}
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{top:5,right:5,left:-10,bottom:0}}>
            <defs key="ci-defs">
              <linearGradient id="gradGross" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gradNet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid key="ci-grid" strokeDasharray="3 3" stroke="#f3f4f6" vertical={false}/>
            <XAxis key="ci-xaxis" dataKey="month" tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
            <YAxis key="ci-yaxis" tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false} tickFormatter={fmtM}/>
            <Tooltip key="ci-tooltip" content={<CustomTooltip/>}/>
            <Area key="ci-gross" type="monotone" dataKey="gross" name="Doanh thu gộp" stroke="#3b82f6" strokeWidth={2} fill="url(#gradGross)"/>
            <Area key="ci-net" type="monotone" dataKey="net"   name="Thu nhập thực" stroke="#10b981" strokeWidth={2.5} fill="url(#gradNet)"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Source breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div style={{fontWeight:700,fontSize:"0.95rem"}} className="text-gray-900 mb-1">Nguồn thu {displayMonth.replace("T", "Tháng ")}</div>
          <div style={{fontSize:"0.75rem"}} className="text-gray-400 mb-4">Phân bổ theo loại gói</div>
          
          {pieData.length > 0 ? (
            <div className="flex items-center gap-4">
              <div className="shrink-0">
                <ResponsiveContainer width={130} height={130}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={60}
                      dataKey="value" strokeWidth={2} stroke="#fff">
                      {pieData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {pieData.map(s=>(
                  <div key={s.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{backgroundColor:s.color}}/>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span style={{fontSize:"0.78rem",fontWeight:500}} className="text-gray-700 truncate">{s.name}</span>
                        <span style={{fontSize:"0.75rem",fontWeight:700}} className="text-gray-900">{s.pct}%</span>
                      </div>
                      <div className="mt-0.5 h-1 bg-gray-100 rounded-full">
                        <div className="h-1 rounded-full transition-all" style={{width:`${s.pct}%`,backgroundColor:s.color}}/>
                      </div>
                      <span style={{fontSize:"0.68rem"}} className="text-gray-400">{fmtM(s.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-400" style={{ fontSize: "0.8rem" }}>
              Chưa có dữ liệu giao dịch
            </div>
          )}
        </div>

        {/* Sessions bar chart */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div style={{fontWeight:700,fontSize:"0.95rem"}} className="text-gray-900 mb-1">Số buổi dạy</div>
          <div style={{fontSize:"0.75rem"}} className="text-gray-400 mb-4">6 tháng gần nhất</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={monthlyData.slice(-6)} margin={{top:5,right:5,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false}/>
              <XAxis dataKey="month" tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{borderRadius:12,border:"none",boxShadow:"0 4px 20px rgba(0,0,0,0.1)",fontSize:12}}
                formatter={(v:any)=>[v+" buổi","Số buổi"]}/>
              <Bar dataKey="sessions" name="Buổi dạy" fill="#8b5cf6" radius={[5,5,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top earning students */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div style={{fontWeight:700,fontSize:"0.95rem"}} className="text-gray-900">Top học viên đóng góp</div>
            <div style={{fontSize:"0.75rem"}} className="text-gray-400">Theo doanh thu lũy kế 2025–2026</div>
          </div>
          <span className="text-blue-500 flex items-center gap-1" style={{fontSize:"0.8rem",fontWeight:600}}>
            Tất cả <ChevronRight className="w-3.5 h-3.5"/>
          </span>
        </div>
        <div className="space-y-2">
          {topStudents && topStudents.length > 0 ? topStudents.map((s,i)=>(
            <div key={s.name} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
              <span style={{fontWeight:800,fontSize:"0.85rem",width:20,textAlign:"center"}}
                className={i===0?"text-amber-400":i===1?"text-gray-400":i===2?"text-orange-400":"text-gray-300"}>
                {i+1}
              </span>
              <img src={s.avatar} alt="" className="w-9 h-9 rounded-xl object-cover shrink-0"/>
              <div className="flex-1 min-w-0">
                <div style={{fontWeight:600,fontSize:"0.88rem"}} className="text-gray-900 truncate">{s.name}</div>
                <div style={{fontSize:"0.7rem"}} className="text-gray-400">{s.sessions} buổi · {s.pkg}</div>
              </div>
              <div className="text-right">
                <div style={{fontWeight:700,fontSize:"0.9rem"}} className="text-gray-900">{fmtM(s.revenue)}</div>
                <div className="flex items-center gap-0.5 justify-end">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400"/>
                  <span style={{fontSize:"0.7rem",fontWeight:600}} className="text-gray-500">{s.rating}</span>
                </div>
              </div>
              {/* Revenue bar */}
              <div className="w-20 hidden sm:block">
                <div className="h-1.5 bg-gray-100 rounded-full">
                  <div className="h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500"
                    style={{width:`${(s.revenue/Math.max(topStudents[0]?.revenue || 1, 1)*100).toFixed(0)}%`}}/>
                </div>
              </div>
            </div>
          )) : (
            <div className="py-8 text-center text-gray-400" style={{ fontSize: "0.8rem" }}>
              Chưa có dữ liệu học viên
            </div>
          )}
        </div>
      </div>

      {/* Commission info */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-blue-300"/>
          </div>
          <div className="flex-1">
            <div style={{fontWeight:700,fontSize:"0.95rem"}} className="mb-1">Gói hiện tại: Pro Coach — Hoa hồng 12%</div>
            <p style={{fontSize:"0.8rem",lineHeight:1.7}} className="text-gray-400 mb-3">
              Bạn đang ở gói <strong className="text-white">Pro Coach</strong>. Nâng lên <strong className="text-amber-400">Elite Coach</strong> để giảm hoa hồng về <strong className="text-emerald-400">0%</strong> — tiết kiệm thêm {fmtM(curMonth.gross*0.12)} mỗi tháng.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="bg-white/10 rounded-xl px-3 py-2 text-center">
                <div style={{fontWeight:700,fontSize:"0.85rem"}} className="text-white">12%</div>
                <div style={{fontSize:"0.65rem"}} className="text-gray-400">HH hiện tại</div>
              </div>
              <div className="flex-1 min-w-20">
                <div className="flex justify-between mb-1">
                  <span style={{fontSize:"0.7rem"}} className="text-gray-400">Pro Coach</span>
                  <span style={{fontSize:"0.7rem"}} className="text-amber-400">Elite Coach</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full">
                  <div className="h-2 bg-gradient-to-r from-blue-400 to-amber-400 rounded-full" style={{width:"72%"}}/>
                </div>
                <div style={{fontSize:"0.68rem"}} className="text-gray-400 mt-1">72% đến Elite (4.3M đ doanh thu nữa)</div>
              </div>
              <button className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-gray-900 rounded-xl hover:from-amber-500 hover:to-orange-500 transition-all shadow-lg"
                style={{fontSize:"0.8rem",fontWeight:700}}>
                🚀 Nâng cấp Elite
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Transactions Tab ─────────────────────────────────────────────────────────
function TransactionsTab({ transactions = TRANSACTIONS }: { transactions?: Tx[] }) {
  const [search,setSearch] = useState("");
  const [filter,setFilter] = useState<"all"|TxStatus|string>("all");
  const [typeFilter,setTypeFilter] = useState("Tất cả");
  const [showDetail,setShowDetail] = useState<string|null>(null);

  const types = ["Tất cả","Buổi lẻ","Gói 8 buổi","Gói tháng","Gói 3 tháng"];

  const filtered = transactions.filter(t=>{
    if(search&&!t.student.toLowerCase().includes(search.toLowerCase())&&
       !t.package.toLowerCase().includes(search.toLowerCase())) return false;
    if(filter!=="all"&&t.status!==filter) return false;
    if(typeFilter!=="Tất cả"&&t.type!==typeFilter) return false;
    return true;
  });

  const totalNet = filtered.filter(t=>t.status==="paid").reduce((s,t)=>s+t.net,0);
  const totalPending = filtered.filter(t=>t.status==="pending").reduce((s,t)=>s+t.gross,0);

  return (
    <div className="space-y-4">
      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {label:"Đã nhận (lọc)", value:fmtM(totalNet),     color:"text-emerald-600", bg:"bg-emerald-50"},
          {label:"Chờ xử lý",     value:fmtM(totalPending), color:"text-amber-600",   bg:"bg-amber-50"},
          {label:"Tổng giao dịch",value:filtered.length+"", color:"text-blue-600",    bg:"bg-blue-50"},
        ].map(({label,value,color,bg})=>(
          <div key={label} className={`${bg} rounded-xl px-3 py-2.5 text-center`}>
            <div style={{fontWeight:800,fontSize:"1rem"}} className={color}>{value}</div>
            <div style={{fontSize:"0.68rem"}} className="text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm học viên, gói..."
            className="pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 w-44"
            style={{fontSize:"0.82rem"}}/>
        </div>
        <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
          {([["all","Tất cả"],["paid","Đã nhận"],["pending","Chờ"],["refunded","Hoàn"]] as [string,string][]).map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v as any)}
              className={`px-3 py-2 text-sm transition-colors border-r border-gray-100 last:border-0 ${filter===v?"bg-blue-500 text-white":"text-gray-500 hover:bg-gray-50"}`}
              style={{fontSize:"0.75rem",fontWeight:filter===v?700:500}}>{l}</button>
          ))}
        </div>
        <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 focus:outline-none"
          style={{fontSize:"0.8rem"}}>
          {types.map(t=><option key={t}>{t}</option>)}
        </select>
        <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 ml-auto"
          style={{fontSize:"0.8rem",fontWeight:500}}>
          <Download className="w-3.5 h-3.5"/> Xuất CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
          {["Học viên","Gói","Doanh thu","HH 12%","Thu thực","Trạng thái","Phương thức",""].map((h,i)=>(
            <div key={i} className={`${i===0?"col-span-3":i===1?"col-span-2":i===7?"col-span-1":"col-span-1"} text-gray-400`}
              style={{fontSize:"0.68rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.04em"}}>
              {h}
            </div>
          ))}
        </div>

        <div className="divide-y divide-gray-50">
          {filtered.map(tx=>(
            <div key={tx.id}>
              <div className="grid grid-cols-12 gap-2 px-4 py-3 hover:bg-gray-50/50 transition-colors items-center cursor-pointer"
                onClick={()=>setShowDetail(d=>d===tx.id?null:tx.id)}>
                <div className="col-span-12 sm:col-span-3 flex items-center gap-2.5">
                  <img src={tx.avatar} alt="" className="w-8 h-8 rounded-xl object-cover shrink-0"/>
                  <div className="min-w-0">
                    <div style={{fontWeight:600,fontSize:"0.85rem"}} className="text-gray-900 truncate">{tx.student}</div>
                    <div style={{fontSize:"0.68rem"}} className="text-gray-400">{tx.date} · #{tx.id}</div>
                  </div>
                </div>
                <div className="hidden sm:block sm:col-span-2">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg" style={{fontSize:"0.72rem",fontWeight:600}}>{tx.type}</span>
                  <div style={{fontSize:"0.68rem"}} className="text-gray-400 mt-0.5 truncate">{tx.package}</div>
                </div>
                <div className="hidden sm:block sm:col-span-1">
                  <span style={{fontSize:"0.8rem",fontWeight:600}} className="text-gray-700">{fmtM(tx.gross)}</span>
                </div>
                <div className="hidden sm:block sm:col-span-1">
                  <span style={{fontSize:"0.78rem",fontWeight:500}} className="text-red-400">-{fmtM(tx.commission)}</span>
                </div>
                <div className="hidden sm:block sm:col-span-1">
                  <span style={{fontSize:"0.85rem",fontWeight:700}} className="text-emerald-600">{fmtM(tx.net)}</span>
                </div>
                <div className="hidden sm:block sm:col-span-2">
                  <StatusBadge status={tx.status}/>
                  {tx.note&&<div style={{fontSize:"0.65rem"}} className="text-gray-400 mt-0.5">{tx.note}</div>}
                </div>
                <div className="hidden sm:flex sm:col-span-1 items-center gap-1">
                  <span style={{fontSize:"0.72rem"}} className="text-gray-500">{tx.method}</span>
                </div>
                <div className="hidden sm:flex sm:col-span-1 justify-end">
                  {showDetail===tx.id?<ChevronUp className="w-3.5 h-3.5 text-gray-400"/>:<ChevronDown className="w-3.5 h-3.5 text-gray-400"/>}
                </div>
              </div>
              {showDetail===tx.id&&(
                <div className="px-4 pb-3 bg-blue-50/30 border-t border-blue-100">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                    {[
                      {label:"Học viên",  value:tx.student},
                      {label:"Gói dịch vụ",value:tx.package},
                      {label:"Doanh thu gộp",value:fmt(tx.gross)},
                      {label:`Hoa hồng (${(COMMISSION_RATE*100).toFixed(0)}%)`,value:"-"+fmt(tx.commission)},
                      {label:"Thu nhập thực",value:fmt(tx.net)},
                      {label:"Trạng thái",value:STATUS_CFG[tx.status].label},
                      {label:"Phương thức",value:tx.method},
                      {label:"Mã giao dịch",value:tx.id},
                    ].map(({label,value})=>(
                      <div key={label} className="bg-white rounded-xl p-2.5 border border-gray-100">
                        <div style={{fontSize:"0.65rem",fontWeight:600}} className="text-gray-400 uppercase tracking-wide mb-0.5">{label}</div>
                        <div style={{fontSize:"0.82rem",fontWeight:600}} className="text-gray-800">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        {filtered.length===0&&(
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ReceiptText className="w-8 h-8 text-gray-200 mb-2"/>
            <div style={{fontWeight:600,fontSize:"0.9rem"}} className="text-gray-400">Không tìm thấy giao dịch</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Payout Tab ───────────────────────────────────────────────────────────────
function PayoutTab({
  availableBalance = 0,
  pendingBalance = 0,
  payouts = PAYOUTS,
}: {
  availableBalance?: number;
  pendingBalance?: number;
  payouts?: PayoutRow[];
}) {
  const [step,setStep] = useState<"idle"|"confirm"|"done">("idle");
  const [amount,setAmount] = useState(String(availableBalance));

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5"/>
        <div className="absolute -bottom-8 -left-4 w-40 h-40 rounded-full bg-blue-500/10"/>
        <div className="relative">
          <div style={{fontSize:"0.78rem",fontWeight:600}} className="text-gray-400 uppercase tracking-wide mb-1">Số dư khả dụng</div>
          <div style={{fontWeight:800,fontSize:"2rem",lineHeight:1}} className="text-white mb-4">{fmt(availableBalance)}</div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="bg-white/10 rounded-xl px-3 py-2">
              <div style={{fontSize:"0.65rem"}} className="text-gray-400">Đang chờ xử lý</div>
              <div style={{fontWeight:700,fontSize:"0.88rem"}} className="text-amber-300">{fmt(pendingBalance)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Plan Tab ─────────────────────────────────────────────────────────────────
function PlanTab() {
  const plans = [
    { id:"starter",  name:"Starter",    badge:"",       commission:20, monthlyFee:0,       limit:"10 HV",  features:["Upload video","Lịch dạy cơ bản","Nhắn tin học viên"],  current:false },
    { id:"pro",      name:"Pro Coach",  badge:"Hiện tại",commission:12,monthlyFee:0,        limit:"Không giới hạn",features:["Tất cả tính năng Starter","Video Studio + 360°","AI Phân tích","So sánh kỹ thuật","Ưu tiên tìm kiếm"],current:true },
    { id:"elite",    name:"Elite Coach",badge:"Đề xuất",  commission:0,  monthlyFee:499000, limit:"Không giới hạn",features:["Tất cả tính năng Pro","Hoa hồng 0%","Badge Elite","Hỗ trợ ưu tiên 24/7","Analytics nâng cao","Trang HLV premium"],current:false },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {plans.map(p=>(
          <div key={p.id}
            className={`rounded-2xl p-5 border-2 relative overflow-hidden ${p.current?"border-blue-500 bg-white shadow-lg shadow-blue-100":p.id==="elite"?"border-amber-400 bg-white":"border-gray-200 bg-white"}`}>
            {p.badge&&(
              <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-white ${p.current?"bg-blue-500":"bg-amber-400"}`}
                style={{fontSize:"0.6rem",fontWeight:800}}>{p.badge}</div>
            )}
            <div style={{fontWeight:800,fontSize:"1rem"}} className="text-gray-900 mb-1">{p.name}</div>
            <div className="mb-4">
              <span style={{fontWeight:800,fontSize:"1.8rem",lineHeight:1}} className={p.commission===0?"text-emerald-500":"text-gray-900"}>{p.commission}%</span>
              <span style={{fontSize:"0.78rem"}} className="text-gray-400 ml-1">hoa hồng</span>
              {p.monthlyFee>0&&<div style={{fontSize:"0.78rem"}} className="text-gray-500 mt-0.5">+ {fmtM(p.monthlyFee)}/tháng</div>}
              {p.monthlyFee===0&&<div style={{fontSize:"0.78rem"}} className="text-emerald-500 mt-0.5 font-semibold">Không phí cố định</div>}
            </div>
            <div className="space-y-1.5 mb-4">
              <div style={{fontSize:"0.72rem",fontWeight:600}} className="text-gray-400 uppercase tracking-wide">Giới hạn: {p.limit}</div>
              {p.features.map(f=>(
                <div key={f} className="flex items-start gap-1.5">
                  <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${p.current||p.id==="elite"?"text-blue-500":"text-gray-300"}`}/>
                  <span style={{fontSize:"0.78rem"}} className="text-gray-600">{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
type IncomeTab = "overview" | "transactions" | "payout" | "plan";

export function CoachIncome() {
  const [tab, setTab] = useState<IncomeTab>("overview");
  const [overview, setOverview] = useState<CoachIncomeOverview | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyIncomeRow[]>([]);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [topStudents, setTopStudents] = useState<TopStudentRow[]>([]);
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    Promise.all([
      coachWorkspaceApi.getIncomeOverview(),
      coachWorkspaceApi.getMonthlyChart(),
      coachWorkspaceApi.getIncomeTransactions(),
      coachWorkspaceApi.getTopStudents(),
      coachWorkspaceApi.getPayouts(),
    ])
      .then(([overviewData, chartData, transactionData, studentData, payoutData]) => {
        setOverview(overviewData);
        setMonthlyData(chartData?.length ? chartData.map((p: any) => ({ month: p.period, gross: p.value, net: Math.round(p.value * 0.88), sessions: p.count, students: p.count })) : []);
        setTransactions(transactionData?.length ? transactionData.map(mapTransaction) : []);
        setTopStudents(studentData?.length ? studentData.map(mapTopStudent) : []);
        setPayouts(payoutData?.length ? payoutData.map(mapPayout) : []);
        setUsingFallback(false);
      })
      .catch(() => { setUsingFallback(true); });
  }, []);

  const TABS: { id: IncomeTab; label: string; emoji: string; badge?: string }[] = [
    { id:"overview",     label:"Tổng quan",      emoji:"📊" },
    { id:"transactions", label:"Giao dịch",       emoji:"📋", badge:`${transactions.filter(t=>t.status==="pending").length || 0}` },
    { id:"payout",       label:"Rút tiền",        emoji:"💸" },
    { id:"plan",         label:"Gói HLV",         emoji:"⭐" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 style={{fontWeight:800,fontSize:"1.2rem"}} className="text-gray-900">Thu nhập</h1>
          <p style={{fontSize:"0.78rem"}} className="text-gray-400 mt-0.5">Quản lý doanh thu, giao dịch và rút tiền</p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-500"/>
            <div>
              <div style={{fontWeight:800,fontSize:"1rem"}} className="text-emerald-600">{fmt(overview?.availableBalance ?? 0)}</div>
              <div style={{fontSize:"0.62rem"}} className="text-emerald-400">Khả dụng</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm w-fit">
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={`relative flex items-center gap-1.5 px-4 py-2.5 transition-colors border-r border-gray-100 last:border-0 ${tab===t.id?"bg-blue-500 text-white":"text-gray-500 hover:bg-gray-50"}`}
            style={{fontSize:"0.82rem",fontWeight:tab===t.id?700:500}}>
            <span>{t.emoji}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {tab==="overview"     && <OverviewTab monthlyData={monthlyData} topStudents={topStudents} transactions={transactions}/>}
      {tab==="transactions" && <TransactionsTab transactions={transactions}/>}
      {tab==="payout"       && <WalletPanel mode="coach" allowWithdraw allowBankAccount />}
      {tab==="plan"         && <PlanTab/>}
    </div>
  );
}

type MonthlyIncomeRow = typeof MONTHLY_DATA[number];
type TopStudentRow = typeof TOP_STUDENTS[number];
type PayoutRow = typeof PAYOUTS[number];

function mapStatus(status: string | null): TxStatus {
  if (status === "REJECTED") return "refunded";
  if (status === "PROCESSING" || status === "PENDING") return "pending";
  return "paid";
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN");
}

function mapTransaction(tx: WalletTransaction): Tx {
  const gross = Math.abs(tx.amount || 0);
  const commission = tx.type === "BOOKING_COMMISSION" ? gross : 0;
  return {
    id: `tx${tx.id}`,
    date: formatDate(tx.createdAt),
    student: tx.description || tx.referenceType || "Giao dịch ví",
    avatar: AVT.a,
    type: tx.type,
    package: tx.description || tx.referenceType || "Giao dịch",
    gross,
    commission,
    net: Math.max(0, gross - commission),
    status: mapStatus(tx.withdrawalStatus),
    method: tx.bankName || "Ví CoachFinder",
    note: tx.adminNote || undefined,
  };
}

function mapPayout(tx: WalletTransaction): PayoutRow {
  return {
    amount: Math.abs(tx.amount || 0),
    date: formatDate(tx.createdAt),
    method: tx.bankName || "Ngân hàng",
    ref: tx.referenceId || `WD-${tx.id}`,
  };
}

function mapTopStudent(student: CoachTopStudent, index: number): TopStudentRow {
  return {
    name: student.traineeName,
    avatar: [AVT.a, AVT.b, AVT.c][index % 3],
    revenue: student.revenue,
    sessions: student.sessions,
    rating: 5,
    pkg: "Học viên",
  };
}
