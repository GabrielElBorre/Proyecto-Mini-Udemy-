import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  FaFacebook,
  FaTwitter,
  FaWhatsapp,
  FaLinkedin,
  FaLink,
  FaCopy
} from "react-icons/fa";
import Notification from "./Notification";

export default function ShareButtons({ course, size = "md" }) {
  const [notification, setNotification] = useState(null);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/curso/${course?._id}`
    : "";
  const shareText = `¡Mira este curso: ${course?.title || "Curso"}!`;
  const shareTitle = course?.title || "Curso";

  const handleShare = (platform) => {
    const url = encodeURIComponent(shareUrl);
    const text = encodeURIComponent(shareText);
    const title = encodeURIComponent(shareTitle);

    let shareLink = "";

    switch (platform) {
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case "whatsapp":
        shareLink = `https://wa.me/?text=${text}%20${url}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      default:
        return;
    }

    window.open(shareLink, "_blank", "width=600,height=400");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setNotification({
        message: "Link copiado al portapapeles",
        type: "success"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setNotification({
        message: "Error al copiar link",
        type: "error"
      });
    }
  };

  const sizeClasses = {
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg"
  };

  const iconSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <motion.button
          onClick={() => handleShare("facebook")}
          className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Compartir en Facebook"
        >
          <FaFacebook className={iconSize[size]} />
        </motion.button>

        <motion.button
          onClick={() => handleShare("twitter")}
          className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-sky-500 text-white hover:bg-sky-600 transition-colors`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Compartir en Twitter"
        >
          <FaTwitter className={iconSize[size]} />
        </motion.button>

        <motion.button
          onClick={() => handleShare("whatsapp")}
          className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Compartir en WhatsApp"
        >
          <FaWhatsapp className={iconSize[size]} />
        </motion.button>

        <motion.button
          onClick={() => handleShare("linkedin")}
          className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-blue-700 text-white hover:bg-blue-800 transition-colors`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Compartir en LinkedIn"
        >
          <FaLinkedin className={iconSize[size]} />
        </motion.button>

        <motion.button
          onClick={handleCopyLink}
          className={`${sizeClasses[size]} flex items-center justify-center rounded-full ${
            copied
              ? "bg-green-500 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          } transition-colors`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Copiar link"
        >
          {copied ? (
            <FaLink className={iconSize[size]} />
          ) : (
            <FaCopy className={iconSize[size]} />
          )}
        </motion.button>
      </div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
          duration={3000}
        />
      )}
    </>
  );
}

