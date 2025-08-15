export default function FeatureCard({ icon: Icon, color, title, description }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className={`${color} mb-4`}>
        <Icon size={48} className="mx-auto" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
