import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaTrophy, FaDownload, FaShare } from "react-icons/fa";
import { useRef, useState } from "react";
import jsPDF from "jspdf";

export default function Certificate({ course, user, completedAt }) {
  const certificateRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      
      // Crear nuevo documento PDF (formato A4 horizontal para certificado)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);

      // Fondo degradado (simulado con rectángulos)
      pdf.setFillColor(255, 248, 220); // Amarillo claro
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');

      // Borde decorativo
      pdf.setDrawColor(255, 193, 7); // Amarillo dorado
      pdf.setLineWidth(2);
      pdf.rect(margin, margin, contentWidth, contentHeight);

      // Título del certificado
      pdf.setFontSize(32);
      pdf.setTextColor(33, 37, 41); // Gris oscuro
      pdf.setFont(undefined, 'bold');
      const titleText = "Certificado de Finalización";
      const titleWidth = pdf.getTextWidth(titleText);
      pdf.text(titleText, (pageWidth - titleWidth) / 2, margin + 30);

      // Línea decorativa
      pdf.setDrawColor(255, 193, 7);
      pdf.setLineWidth(1);
      pdf.line(margin + 30, margin + 40, pageWidth - margin - 30, margin + 40);

      // Texto "Se certifica que"
      pdf.setFontSize(16);
      pdf.setTextColor(108, 117, 125); // Gris
      pdf.setFont(undefined, 'normal');
      const certifyText = "Se certifica que";
      const certifyWidth = pdf.getTextWidth(certifyText);
      pdf.text(certifyText, (pageWidth - certifyWidth) / 2, margin + 60);

      // Nombre del estudiante
      pdf.setFontSize(28);
      pdf.setTextColor(99, 102, 241); // Indigo
      pdf.setFont(undefined, 'bold');
      const studentName = user?.name || "Estudiante";
      const nameWidth = pdf.getTextWidth(studentName);
      pdf.text(studentName, (pageWidth - nameWidth) / 2, margin + 80);

      // Texto "ha completado exitosamente el curso"
      pdf.setFontSize(16);
      pdf.setTextColor(108, 117, 125);
      pdf.setFont(undefined, 'normal');
      const completedText = "ha completado exitosamente el curso";
      const completedWidth = pdf.getTextWidth(completedText);
      pdf.text(completedText, (pageWidth - completedWidth) / 2, margin + 100);

      // Título del curso
      pdf.setFontSize(22);
      pdf.setTextColor(33, 37, 41);
      pdf.setFont(undefined, 'bold');
      const courseTitle = `"${course.title}"`;
      const courseTitleWidth = pdf.getTextWidth(courseTitle);
      // Si el título es muy largo, dividirlo en múltiples líneas
      if (courseTitleWidth > contentWidth - 20) {
        const words = courseTitle.split(' ');
        let line = '';
        let yPos = margin + 120;
        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + ' ';
          const testWidth = pdf.getTextWidth(testLine);
          if (testWidth > contentWidth - 20 && i > 0) {
            const lineWidth = pdf.getTextWidth(line);
            pdf.text(line, (pageWidth - lineWidth) / 2, yPos);
            line = words[i] + ' ';
            yPos += 10;
          } else {
            line = testLine;
          }
        }
        const finalLineWidth = pdf.getTextWidth(line);
        pdf.text(line, (pageWidth - finalLineWidth) / 2, yPos);
      } else {
        pdf.text(courseTitle, (pageWidth - courseTitleWidth) / 2, margin + 120);
      }

      // Fecha de completado
      if (completedAt) {
        pdf.setFontSize(14);
        pdf.setTextColor(108, 117, 125);
        pdf.setFont(undefined, 'normal');
        const dateText = `Completado el ${new Date(completedAt).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}`;
        const dateWidth = pdf.getTextWidth(dateText);
        pdf.text(dateText, (pageWidth - dateWidth) / 2, margin + 150);
      }

      // Información del instructor
      if (course.instructor) {
        pdf.setFontSize(12);
        pdf.setTextColor(108, 117, 125);
        pdf.setFont(undefined, 'normal');
        const instructorText = `Instructor: ${course.instructor.name || course.instructor}`;
        const instructorWidth = pdf.getTextWidth(instructorText);
        pdf.text(instructorText, (pageWidth - instructorWidth) / 2, margin + 170);
      }

      // Número de certificado
      pdf.setFontSize(10);
      pdf.setTextColor(134, 142, 150);
      pdf.setFont(undefined, 'normal');
      const certId = `Certificado ID: ${course._id?.slice(-8).toUpperCase() || "N/A"}`;
      const certIdWidth = pdf.getTextWidth(certId);
      pdf.text(certId, (pageWidth - certIdWidth) / 2, pageHeight - margin - 20);

      // Fecha de emisión
      const issueDate = `Emitido el ${new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`;
      const issueDateWidth = pdf.getTextWidth(issueDate);
      pdf.text(issueDate, (pageWidth - issueDateWidth) / 2, pageHeight - margin - 10);

      // Guardar el PDF
      const fileName = `Certificado_${course.title.replace(/[^a-z0-9]/gi, '_')}_${user?.name?.replace(/[^a-z0-9]/gi, '_') || 'Estudiante'}.pdf`;
      pdf.save(fileName);
      
      setDownloading(false);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error al generar el certificado PDF. Por favor, intenta de nuevo.");
      setDownloading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `He completado el curso: ${course.title}`,
        text: `¡He completado el curso "${course.title}"! 🎉`,
        url: window.location.href,
      });
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(window.location.href);
      alert("¡Enlace copiado al portapapeles!");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card 
          ref={certificateRef}
          className="bg-gradient-to-br from-yellow-50 via-white to-yellow-50 dark:from-yellow-900/20 dark:via-gray-800 dark:to-yellow-900/20 border-4 border-yellow-400 dark:border-yellow-600 shadow-2xl"
        >
          <CardContent className="p-12">
            {/* Decoración superior */}
            <div className="flex justify-center mb-8">
              <div className="text-6xl">🎓</div>
            </div>

            {/* Título del certificado */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Certificado de Finalización
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto"></div>
            </div>

            {/* Contenido */}
            <div className="text-center mb-8 space-y-4">
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Se certifica que
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-6">
                {user?.name || "Estudiante"}
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                ha completado exitosamente el curso
              </p>
              <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mb-6">
                "{course.title}"
              </h3>
              {completedAt && (
                <p className="text-gray-600 dark:text-gray-400">
                  Completado el {new Date(completedAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              )}
            </div>

            {/* Badge de logro */}
            <div className="flex justify-center mb-8">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-6">
                <FaTrophy className="text-6xl text-white" />
              </div>
            </div>

            {/* Información adicional */}
            {course.instructor && (
              <div className="text-center text-gray-600 dark:text-gray-400 mb-8">
                <p className="text-sm">
                  Instructor: <span className="font-semibold">{course.instructor.name}</span>
                </p>
              </div>
            )}

            {/* Número de certificado */}
            <div className="text-center text-xs text-gray-500 dark:text-gray-400 border-t pt-4">
              <p>Certificado ID: {course._id?.slice(-8).toUpperCase() || "N/A"}</p>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
              <Button
                onClick={handleDownload}
                disabled={downloading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 gap-2"
              >
                <FaDownload />
                {downloading ? "Generando PDF..." : "Descargar PDF"}
              </Button>
              <Button
                variant="outline"
                onClick={handleShare}
                className="gap-2"
              >
                <FaShare />
                Compartir
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

