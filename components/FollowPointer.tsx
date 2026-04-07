import stringToColor from "@/lib/stringToColor";
import { motion } from "framer-motion";

const FollowPointer = ({
  x,
  y,
  info,
}: {
  x: number;
  y: number;

  info: { name: string; email: string; avatar: string };
}) => {
  const color = stringToColor(info.email || info.name || "1");

  return (
    <motion.div
      className="pointer-events-none fixed z-50"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
    >
      <div className="relative -translate-x-1 -translate-y-1">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill={color}
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-md"
        >
          <path d="M4 3L17 12L11 13.5L8 20L4 3Z" />
        </svg>

        <motion.div
          style={{ backgroundColor: color }}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="absolute left-4 top-4 rounded-full px-2 py-1 text-xs font-semibold text-white shadow"
        >
          {info?.name || info.email}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FollowPointer;
