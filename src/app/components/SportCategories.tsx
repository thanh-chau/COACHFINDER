const FOOTBALL_IMG = "https://images.unsplash.com/photo-1574772135913-d519461c3996?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHNvY2NlciUyMGNvYWNoJTIwdHJhaW5pbmclMjBmaWVsZHxlbnwxfHx8fDE3NzI2MzU1ODB8MA&ixlib=rb-4.1.0&q=80&w=1080";
const SWIMMING_IMG = "https://images.unsplash.com/photo-1506833787259-9d3b2eca6cdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2ltbWluZyUyMGNvYWNoJTIwcG9vbCUyMGF0aGxldGV8ZW58MXx8fHwxNzcyNjM1NTgwfDA&ixlib=rb-4.1.0&q=80&w=1080";
const FITNESS_IMG = "https://images.unsplash.com/photo-1758875569414-120ebc62ada3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwY29hY2glMjBneW0lMjB0cmFpbmluZyUyMHNlc3Npb258ZW58MXx8fHwxNzcyNjM1NTc5fDA&ixlib=rb-4.1.0&q=80&w=1080";
const YOGA_IMG = "https://images.unsplash.com/photo-1765872978468-b4c7b28e5622?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwaW5zdHJ1Y3RvciUyMGNsYXNzJTIwc3R1ZGlvfGVufDF8fHx8MTc3MjYzNTU4MXww&ixlib=rb-4.1.0&q=80&w=1080";
const BOXING_IMG = "https://images.unsplash.com/photo-1758778932701-76ef06971b93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3hpbmclMjBtYXJ0aWFsJTIwYXJ0cyUyMGNvYWNoJTIwdHJhaW5pbmd8ZW58MXx8fHwxNzcyNjM1NTgxfDA&ixlib=rb-4.1.0&q=80&w=1080";
const BASKETBALL_IMG = "https://images.unsplash.com/photo-1762025744151-4bd3b166b271?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNrZXRiYWxsJTIwY29hY2glMjB0cmFpbmluZyUyMGNvdXJ0fGVufDF8fHx8MTc3MjYzNTU4MXww&ixlib=rb-4.1.0&q=80&w=1080";
const RUNNING_IMG = "https://images.unsplash.com/photo-1730251446354-bc3570752717?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwY29hY2glMjBhdGhsZXRlJTIwdHJhY2slMjBmaWVsZHxlbnwxfHx8fDE3NzI2MzU1ODV8MA&ixlib=rb-4.1.0&q=80&w=1080";

const categories = [
  { name: "Thể hình & PT", count: 420, image: FITNESS_IMG, color: "from-orange-600 to-red-700" },
  { name: "Bóng đá", count: 315, image: FOOTBALL_IMG, color: "from-green-600 to-emerald-700" },
  { name: "Bơi lội", count: 198, image: SWIMMING_IMG, color: "from-blue-500 to-cyan-600" },
  { name: "Yoga & Pilates", count: 267, image: YOGA_IMG, color: "from-purple-500 to-violet-600" },
  { name: "Quyền anh & MMA", count: 143, image: BOXING_IMG, color: "from-red-600 to-rose-700" },
  { name: "Bóng rổ", count: 112, image: BASKETBALL_IMG, color: "from-amber-500 to-orange-600" },
  { name: "Chạy bộ", count: 231, image: RUNNING_IMG, color: "from-teal-500 to-green-600" },
  { name: "Xem tất cả →", count: 30, image: null, color: "from-gray-600 to-gray-700" },
];

export function SportCategories() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-full px-4 py-1.5 mb-4">
            <span className="text-orange-500" style={{ fontSize: "0.85rem", fontWeight: 600 }}>🏆 Danh mục môn thể thao</span>
          </div>
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 800, lineHeight: 1.2 }} className="text-gray-900 mb-4">
            Chọn Môn Thể Thao Của Bạn
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto" style={{ fontSize: "1rem", lineHeight: 1.7 }}>
            Chúng tôi có HLV chuyên nghiệp cho hơn 30 môn thể thao khác nhau. 
            Từ thể hình, bóng đá đến yoga và thiền định.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.name}
              className="group relative overflow-hidden rounded-2xl aspect-[4/3] cursor-pointer text-left"
            >
              {/* Background image or gradient */}
              {cat.image ? (
                <>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                </>
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                  <span className="text-5xl">🏅</span>
                </div>
              )}

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }} className="text-white mb-0.5">
                  {cat.name}
                </div>
                {cat.image && (
                  <div style={{ fontSize: "0.75rem" }} className="text-gray-300">
                    {cat.count} HLV
                  </div>
                )}
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 border-2 border-orange-400/0 group-hover:border-orange-400/60 rounded-2xl transition-all duration-300" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
