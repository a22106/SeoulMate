import { useState } from "react";

const designTokens = {
  colors: {
    primary: {
      name: "Seoul Blue",
      hex: "#2563EB",
      desc: "서울의 하늘과 신뢰감을 상징. CTA 버튼, 링크, 주요 인터랙션에 사용",
      shades: [
        { label: "50", hex: "#EFF6FF" },
        { label: "100", hex: "#DBEAFE" },
        { label: "200", hex: "#BFDBFE" },
        { label: "300", hex: "#93C5FD" },
        { label: "400", hex: "#60A5FA" },
        { label: "500", hex: "#3B82F6" },
        { label: "600 ★", hex: "#2563EB" },
        { label: "700", hex: "#1D4ED8" },
        { label: "800", hex: "#1E40AF" },
        { label: "900", hex: "#1E3A8A" },
      ],
    },
    secondary: {
      name: "Hanok Coral",
      hex: "#F97316",
      desc: "한옥 단청의 따뜻한 주황. 강조, 배지, 경고, 알림에 사용",
      shades: [
        { label: "50", hex: "#FFF7ED" },
        { label: "100", hex: "#FFEDD5" },
        { label: "200", hex: "#FED7AA" },
        { label: "300", hex: "#FDBA74" },
        { label: "400", hex: "#FB923C" },
        { label: "500 ★", hex: "#F97316" },
        { label: "600", hex: "#EA580C" },
        { label: "700", hex: "#C2410C" },
      ],
    },
    success: { name: "Namsan Green", hex: "#10B981", desc: "성공, 완료 상태" },
    warning: { name: "Gwanghwamun Gold", hex: "#F59E0B", desc: "주의, 경고 상태" },
    danger: { name: "Alert Red", hex: "#EF4444", desc: "에러, 위험 경고" },
  },
  gradients: [
    {
      name: "Seoul Horizon",
      css: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
      usage: "메인 히어로, 스플래시 화면, 주요 CTA 배경",
      tag: "Signature",
    },
    {
      name: "Sunrise Warm",
      css: "linear-gradient(135deg, #2563EB 0%, #F97316 100%)",
      usage: "강조 배너, 프로모션 카드",
      tag: "Accent",
    },
    {
      name: "Soft Sky",
      css: "linear-gradient(180deg, #EFF6FF 0%, #FFFFFF 100%)",
      usage: "페이지 배경, 카드 배경",
      tag: "Background",
    },
  ],
  backgrounds: {
    light: [
      { name: "Main Background", hex: "#FAFBFD", usage: "기본 페이지 배경" },
      { name: "Card Surface", hex: "#FFFFFF", usage: "카드, 모달, 입력 필드 배경" },
      { name: "Subtle Surface", hex: "#F1F5F9", usage: "섹션 구분, 코드 블록 배경" },
      { name: "Hover State", hex: "#E2E8F0", usage: "호버/선택 상태 배경" },
    ],
  },
  text: {
    light: [
      { name: "Primary", hex: "#0F172A", usage: "제목, 본문 텍스트" },
      { name: "Secondary", hex: "#475569", usage: "보조 설명, 캡션" },
      { name: "Tertiary", hex: "#94A3B8", usage: "플레이스홀더, 비활성 텍스트" },
      { name: "On Primary", hex: "#FFFFFF", usage: "Primary 버튼 위 텍스트" },
    ],
  },
  typography: {
    display: { name: "Outfit", weight: "700", fallback: "sans-serif", usage: "로고, 히어로 타이틀" },
    heading: { name: "Outfit", weight: "600", fallback: "sans-serif", usage: "섹션 제목 (H1-H4)" },
    body: { name: "Pretendard", weight: "400/500", fallback: "system-ui", usage: "본문, 설명, UI 텍스트 (한/영 모두 지원)" },
    mono: { name: "JetBrains Mono", weight: "400", fallback: "monospace", usage: "코드, 주소, 전화번호" },
  },
  typeScale: [
    { name: "Display", size: "36px", lineHeight: "1.1", weight: "700" },
    { name: "H1", size: "30px", lineHeight: "1.2", weight: "600" },
    { name: "H2", size: "24px", lineHeight: "1.3", weight: "600" },
    { name: "H3", size: "20px", lineHeight: "1.4", weight: "600" },
    { name: "Body L", size: "18px", lineHeight: "1.6", weight: "400" },
    { name: "Body", size: "16px", lineHeight: "1.6", weight: "400" },
    { name: "Body S", size: "14px", lineHeight: "1.5", weight: "400" },
    { name: "Caption", size: "12px", lineHeight: "1.4", weight: "500" },
  ],
  spacing: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80],
  radius: [
    { name: "sm", value: "6px", usage: "입력 필드, 작은 버튼" },
    { name: "md", value: "12px", usage: "카드, 모달" },
    { name: "lg", value: "16px", usage: "큰 카드, 이미지 컨테이너" },
    { name: "xl", value: "24px", usage: "플로팅 버튼, 배지" },
    { name: "full", value: "9999px", usage: "원형 아바타, 태그" },
  ],
  shadows: [
    { name: "sm", value: "0 1px 2px rgba(15,23,42,0.06)", usage: "미세한 깊이감" },
    { name: "md", value: "0 4px 12px rgba(15,23,42,0.08)", usage: "카드 기본" },
    { name: "lg", value: "0 12px 32px rgba(15,23,42,0.12)", usage: "모달, 드롭다운" },
    { name: "xl", value: "0 24px 48px rgba(15,23,42,0.16)", usage: "플로팅 요소" },
    { name: "glow", value: "0 0 24px rgba(37,99,235,0.3)", usage: "포커스, CTA 강조" },
  ],
};

function ColorSwatch({ hex, label, large }) {
  const [copied, setCopied] = useState(false);
  return (
    <div
      style={{ cursor: "pointer", textAlign: "center" }}
      onClick={() => {
        navigator.clipboard?.writeText(hex);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
    >
      <div
        style={{
          width: large ? 80 : 56,
          height: large ? 80 : 56,
          borderRadius: 12,
          background: hex,
          border: hex === "#FFFFFF" || hex === "#FAFBFD" ? "1px solid #E2E8F0" : "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          margin: "0 auto 6px",
          transition: "transform 0.15s",
        }}
      />
      <div style={{ fontSize: 11, fontWeight: 600, color: "#334155" }}>{label}</div>
      <div style={{ fontSize: 10, color: copied ? "#10B981" : "#94A3B8", fontFamily: "monospace" }}>
        {copied ? "Copied!" : hex}
      </div>
    </div>
  );
}

function GradientCard({ gradient }) {
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "center", padding: "16px 0", borderBottom: "1px solid #F1F5F9" }}>
      <div
        style={{
          width: 120,
          height: 64,
          borderRadius: 12,
          background: gradient.css,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: "#0F172A" }}>{gradient.name}</span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: 9999,
              background: gradient.tag === "Signature" ? "#EFF6FF" : "#FFF7ED",
              color: gradient.tag === "Signature" ? "#2563EB" : "#EA580C",
            }}
          >
            {gradient.tag}
          </span>
        </div>
        <div style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}>{gradient.usage}</div>
        <code style={{ fontSize: 11, color: "#94A3B8", fontFamily: "monospace", wordBreak: "break-all" }}>{gradient.css}</code>
      </div>
    </div>
  );
}

function Section({ title, description, children }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", margin: "0 0 4px", letterSpacing: "-0.02em" }}>{title}</h2>
      {description && <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 20px" }}>{description}</p>}
      {children}
    </div>
  );
}

export default function DesignSystem() {
  const { colors, gradients, backgrounds, text, typography, typeScale, spacing, radius, shadows } = designTokens;

  return (
    <div style={{ background: "#FAFBFD", minHeight: "100vh", fontFamily: "'Pretendard', system-ui, sans-serif" }}>
      {/* Hero Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
          padding: "48px 32px 40px",
          color: "white",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", opacity: 0.8, marginBottom: 8 }}>
            SEOULMATE DESIGN SYSTEM
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 700, margin: "0 0 12px", letterSpacing: "-0.03em" }}>
            Seoul Survival Agent
          </h1>
          <p style={{ fontSize: 16, opacity: 0.85, margin: 0, lineHeight: 1.6 }}>
            서울 거주 외국인을 위한 AI 생활 에이전트의 디자인 시스템.
            <br />
            신뢰감 있는 블루를 기반으로, 따뜻하고 접근성 높은 인터페이스를 지향합니다.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 32px 80px" }}>

        {/* Design Philosophy */}
        <Section title="🎨 디자인 철학">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { emoji: "🌏", title: "Trustworthy", desc: "공공 서비스 수준의 신뢰감. 블루 기반 팔레트로 안정감 전달" },
              { emoji: "🤝", title: "Approachable", desc: "Coral 액센트와 둥근 라운딩으로 따뜻하고 친근한 경험" },
              { emoji: "♿", title: "Accessible", desc: "WCAG AA 이상 명도 대비, 다국어·다문화 사용자 고려" },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background: "white",
                  borderRadius: 12,
                  padding: 20,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  border: "1px solid #F1F5F9",
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>{item.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#0F172A", marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Primary Color */}
        <Section title="🔵 Primary Color — Seoul Blue" description="메인 브랜드 컬러. 서울의 하늘과 디지털 신뢰를 상징합니다.">
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {colors.primary.shades.map((s) => (
              <ColorSwatch key={s.label} hex={s.hex} label={s.label} large={s.label.includes("★")} />
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 13, color: "#64748B" }}>
            ★ <strong>600</strong>이 Primary 기본값. 버튼, 링크, 주요 인터랙션에 사용.
          </div>
        </Section>

        {/* Secondary Color */}
        <Section title="🟠 Secondary Color — Hanok Coral" description="한옥 단청에서 영감을 얻은 따뜻한 주황. 강조·알림·배지에 사용합니다.">
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {colors.secondary.shades.map((s) => (
              <ColorSwatch key={s.label} hex={s.hex} label={s.label} large={s.label.includes("★")} />
            ))}
          </div>
        </Section>

        {/* Semantic Colors */}
        <Section title="🚦 Semantic Colors" description="상태를 나타내는 시맨틱 컬러">
          <div style={{ display: "flex", gap: 24 }}>
            {[colors.success, colors.warning, colors.danger].map((c) => (
              <div key={c.name} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    background: c.hex,
                    margin: "0 auto 8px",
                    boxShadow: `0 4px 16px ${c.hex}40`,
                  }}
                />
                <div style={{ fontWeight: 600, fontSize: 13, color: "#0F172A" }}>{c.name}</div>
                <div style={{ fontSize: 11, color: "#94A3B8", fontFamily: "monospace" }}>{c.hex}</div>
                <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Gradient Signatures */}
        <Section title="🌈 Gradient Signatures" description="브랜드 아이덴티티를 강화하는 그라디언트 시스템">
          <div style={{ background: "white", borderRadius: 16, padding: 20, border: "1px solid #F1F5F9" }}>
            {gradients.map((g) => (
              <GradientCard key={g.name} gradient={g} />
            ))}
          </div>
        </Section>

        {/* Background Colors */}
        <Section title="📐 Background Colors" description="라이트 모드 배경 시스템">
          <div style={{ background: "white", borderRadius: 16, padding: 20, border: "1px solid #F1F5F9" }}>
            {backgrounds.light.map((bg) => (
              <div key={bg.name} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: bg.hex,
                    border: "1px solid #E2E8F0",
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{bg.name}</div>
                  <div style={{ fontSize: 11, color: "#94A3B8", fontFamily: "monospace" }}>{bg.hex}</div>
                  <div style={{ fontSize: 11, color: "#64748B" }}>{bg.usage}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Text Colors */}
        <Section title="✏️ Text Colors" description="가독성을 최우선으로 한 텍스트 컬러 시스템">
          <div style={{ background: "white", borderRadius: 16, padding: 20, border: "1px solid #F1F5F9" }}>
            {text.light.map((t) => (
              <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: t.hex,
                    flexShrink: 0,
                    border: t.hex === "#FFFFFF" ? "1px solid #E2E8F0" : "none",
                  }}
                />
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{t.name} </span>
                  <span style={{ fontSize: 11, color: "#94A3B8", fontFamily: "monospace" }}>{t.hex}</span>
                  <div style={{ fontSize: 11, color: "#64748B" }}>{t.usage}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Typography */}
        <Section title="🔤 Typography" description="한/영 모두 아름답게 렌더링되는 폰트 시스템">
          <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #F1F5F9", marginBottom: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {Object.entries(typography).map(([key, font]) => (
                <div key={key} style={{ padding: 16, background: "#FAFBFD", borderRadius: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                    {key}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>{font.name}</div>
                  <div style={{ fontSize: 12, color: "#64748B" }}>Weight: {font.weight} · Fallback: {font.fallback}</div>
                  <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>{font.usage}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #F1F5F9" }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: "#0F172A" }}>Type Scale</div>
            {typeScale.map((t) => (
              <div
                key={t.name}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 16,
                  padding: "10px 0",
                  borderBottom: "1px solid #F8FAFC",
                }}
              >
                <div style={{ width: 60, fontSize: 11, fontWeight: 600, color: "#2563EB", flexShrink: 0 }}>{t.name}</div>
                <div style={{ fontSize: t.size, fontWeight: t.weight, color: "#0F172A", lineHeight: t.lineHeight, flex: 1 }}>
                  서울메이트 SeoulMate
                </div>
                <div style={{ fontSize: 11, color: "#94A3B8", fontFamily: "monospace", flexShrink: 0 }}>
                  {t.size} / {t.lineHeight}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Spacing */}
        <Section title="📏 Spacing Scale" description="4px 기반 간격 시스템 (Tailwind 호환)">
          <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #F1F5F9" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {spacing.map((s) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 40, fontSize: 12, fontWeight: 600, color: "#64748B", textAlign: "right" }}>{s}px</div>
                  <div
                    style={{
                      width: s * 2.5,
                      height: 20,
                      background: `linear-gradient(90deg, #2563EB, #7C3AED)`,
                      borderRadius: 4,
                      opacity: 0.7 + (s / 300),
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Border Radius */}
        <Section title="⬜ Border Radius" description="둥근 모서리로 친근한 느낌 전달">
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {radius.map((r) => (
              <div key={r.name} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: r.value,
                    background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                    margin: "0 auto 8px",
                  }}
                />
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{r.name}</div>
                <div style={{ fontSize: 11, color: "#94A3B8", fontFamily: "monospace" }}>{r.value}</div>
                <div style={{ fontSize: 11, color: "#64748B", maxWidth: 80 }}>{r.usage}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Shadows */}
        <Section title="🔲 Shadows & Elevation" description="깊이감과 계층 구조를 나타내는 그림자 시스템">
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {shadows.map((s) => (
              <div key={s.name} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 16,
                    background: "white",
                    boxShadow: s.value,
                    margin: "0 auto 10px",
                    border: "1px solid #F1F5F9",
                  }}
                />
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{s.name}</div>
                <div style={{ fontSize: 11, color: "#64748B", maxWidth: 90 }}>{s.usage}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Component Preview */}
        <Section title="🧩 Component Preview" description="디자인 토큰이 적용된 핵심 컴포넌트 미리보기">
          <div style={{ background: "white", borderRadius: 16, padding: 32, border: "1px solid #F1F5F9" }}>
            {/* Buttons */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#64748B", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Buttons
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <button
                  style={{
                    background: "#2563EB",
                    color: "white",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
                  }}
                >
                  📸 사진으로 질문하기
                </button>
                <button
                  style={{
                    background: "white",
                    color: "#2563EB",
                    border: "2px solid #2563EB",
                    padding: "10px 24px",
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  💬 채팅하기
                </button>
                <button
                  style={{
                    background: "#F97316",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: 9999,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  🏠 주거 가이드
                </button>
              </div>
            </div>

            {/* Result Card */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#64748B", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Analysis Result Card
              </div>
              <div
                style={{
                  background: "#FAFBFD",
                  borderRadius: 16,
                  padding: 20,
                  border: "1px solid #E2E8F0",
                  maxWidth: 420,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span
                    style={{
                      background: "#EFF6FF",
                      color: "#2563EB",
                      fontSize: 12,
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: 9999,
                    }}
                  >
                    📄 임대차 계약서
                  </span>
                  <span
                    style={{
                      background: "#FEF3C7",
                      color: "#D97706",
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "3px 8px",
                      borderRadius: 9999,
                    }}
                  >
                    ⚠️ 주의사항 있음
                  </span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#0F172A", marginBottom: 8 }}>
                  Monthly rent contract for studio apartment
                </div>
                <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, marginBottom: 12 }}>
                  This is a monthly rent (월세) contract for a studio in Gangnam. 
                  Deposit: ₩10,000,000 / Monthly: ₩800,000...
                </div>
                <div
                  style={{
                    background: "#FFF7ED",
                    borderLeft: "3px solid #F97316",
                    borderRadius: "0 8px 8px 0",
                    padding: "10px 14px",
                    fontSize: 13,
                    color: "#9A3412",
                  }}
                >
                  ⚠️ The early termination clause requires 2 months advance notice
                </div>
              </div>
            </div>

            {/* Chat Bubble */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#64748B", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Chat Bubble
              </div>
              <div style={{ maxWidth: 420 }}>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                  <div
                    style={{
                      background: "#2563EB",
                      color: "white",
                      padding: "10px 16px",
                      borderRadius: "16px 16px 4px 16px",
                      fontSize: 14,
                      maxWidth: "75%",
                    }}
                  >
                    How do I sort recycling in Gangnam?
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div
                    style={{
                      background: "#F1F5F9",
                      color: "#0F172A",
                      padding: "10px 16px",
                      borderRadius: "16px 16px 16px 4px",
                      fontSize: 14,
                      maxWidth: "75%",
                      lineHeight: 1.6,
                    }}
                  >
                    In Gangnam-gu, recycling follows a specific schedule. Recyclables go in transparent bags...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* CSS Variables Export */}
        <Section title="💻 CSS Variables" description="프로젝트에 바로 복사하여 사용할 수 있는 CSS 변수">
          <div
            style={{
              background: "#1E293B",
              borderRadius: 16,
              padding: 24,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              color: "#E2E8F0",
              lineHeight: 1.8,
              overflow: "auto",
            }}
          >
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{`:root {
  /* Primary - Seoul Blue */
  --color-primary-50: #EFF6FF;
  --color-primary-100: #DBEAFE;
  --color-primary-200: #BFDBFE;
  --color-primary-300: #93C5FD;
  --color-primary-400: #60A5FA;
  --color-primary-500: #3B82F6;
  --color-primary-600: #2563EB;  /* ← Default */
  --color-primary-700: #1D4ED8;
  --color-primary-800: #1E40AF;
  --color-primary-900: #1E3A8A;

  /* Secondary - Hanok Coral */
  --color-secondary-500: #F97316;
  --color-secondary-600: #EA580C;

  /* Semantic */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;

  /* Background */
  --bg-main: #FAFBFD;
  --bg-card: #FFFFFF;
  --bg-subtle: #F1F5F9;
  --bg-hover: #E2E8F0;

  /* Text */
  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-tertiary: #94A3B8;

  /* Gradient */
  --gradient-signature: linear-gradient(135deg, #2563EB, #7C3AED);
  --gradient-warm: linear-gradient(135deg, #2563EB, #F97316);
  --gradient-sky: linear-gradient(180deg, #EFF6FF, #FFFFFF);

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* Shadow */
  --shadow-sm: 0 1px 2px rgba(15,23,42,0.06);
  --shadow-md: 0 4px 12px rgba(15,23,42,0.08);
  --shadow-lg: 0 12px 32px rgba(15,23,42,0.12);
  --shadow-glow: 0 0 24px rgba(37,99,235,0.3);
}`}</pre>
          </div>
        </Section>
      </div>
    </div>
  );
}