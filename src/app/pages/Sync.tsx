import { useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Loader2, Calendar } from "lucide-react";

export function Sync() {
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate syncing delay
    const timer = setTimeout(() => {
      navigate("/decomposition");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="size-16 bg-neutral-900 rounded-2xl flex items-center justify-center">
              <Calendar className="size-8 text-white" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-1 -right-1"
            >
              <div className="size-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Loader2 className="size-5 text-white" />
              </div>
            </motion.div>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
          Mapping your coursework…
        </h2>
        <p className="text-neutral-600">
          Analyzing Canvas modules and assignments
        </p>

        <div className="mt-8 flex justify-center">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="size-2 bg-neutral-400 rounded-full"
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}