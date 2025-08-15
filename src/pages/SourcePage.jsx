import { motion } from "framer-motion";
import trustedSources from "../data/trustedSources.js";
export default function SourcesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <h1 className="text-4xl font-bold text-center mb-8">
        Trusted Sources
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {trustedSources.map((src, i) => (
          <motion.a
            key={i}
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition-all flex flex-col items-center text-center"
          >
            <img src={src.logo} alt={src.name} className="h-12 mb-4" />
            <h3 className="text-lg font-semibold">{src.name}</h3>
            <p className="text-gray-500 mt-1">{src.type}</p>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
