import axios from "axios";

/**
 * Controlador para manejar peticiones de IA
 * Usa Hugging Face Inference API (gratuita) como alternativa
 * También puede usar Groq API si se proporciona la clave
 */

// Función para usar Hugging Face (gratuita, no requiere API key)
async function getHuggingFaceResponse(message) {
  try {
    // Usando el modelo Mistral-7B-Instruct que es gratuito y de buena calidad
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        inputs: `<s>[INST] Eres un asistente útil y amigable. Responde de manera clara y concisa en español. ${message} [/INST]`,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          return_full_text: false,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 segundos de timeout
      }
    );

    if (response.data && response.data[0] && response.data[0].generated_text) {
      return response.data[0].generated_text.trim();
    }
    throw new Error("Respuesta inválida de Hugging Face");
  } catch (error) {
    console.error("Error con Hugging Face:", error.message);
    
    // Si Hugging Face falla, usar una respuesta alternativa
    if (error.response?.status === 503) {
      // El modelo está cargando, intentar con otro modelo más ligero
      try {
        const fallbackResponse = await axios.post(
          "https://api-inference.huggingface.co/models/google/flan-t5-base",
          {
            inputs: message,
            parameters: {
              max_length: 200,
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 20000,
          }
        );
        
        if (fallbackResponse.data && fallbackResponse.data[0]) {
          return fallbackResponse.data[0].generated_text || "Lo siento, estoy procesando tu pregunta. Por favor, intenta de nuevo en un momento.";
        }
      } catch (fallbackError) {
        console.error("Error con modelo alternativo:", fallbackError.message);
      }
    }
    
    throw error;
  }
}

// Función alternativa usando Groq (más rápida, requiere API key pero tiene tier gratuito generoso)
async function getGroqResponse(message) {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("GROQ_API_KEY no configurada o vacía");
  }

  try {
    console.log("Enviando petición a Groq con mensaje:", message.substring(0, 50) + "...");
    
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "Eres un asistente útil y amigable de MiniUdemy, una plataforma de cursos online. Responde siempre en español de manera clara, concisa y amigable. Si te preguntan sobre cursos, puedes recomendar cursos de desarrollo (React, JavaScript, Node.js, Python), diseño (UI/UX, Figma, Photoshop), negocios, marketing u otros temas. Sé específico y útil en tus recomendaciones.",
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    console.log("Respuesta de Groq recibida:", response.status);

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      const content = response.data.choices[0].message?.content;
      if (content) {
        return content.trim();
      }
    }
    
    console.error("Estructura de respuesta inesperada:", JSON.stringify(response.data, null, 2));
    throw new Error("Respuesta inválida de Groq: estructura de datos inesperada");
  } catch (error) {
    console.error("Error detallado con Groq:");
    console.error("- Mensaje:", error.message);
    console.error("- Status:", error.response?.status);
    console.error("- Status Text:", error.response?.statusText);
    console.error("- Data:", JSON.stringify(error.response?.data, null, 2));
    
    // Si es un error de autenticación
    if (error.response?.status === 401) {
      throw new Error("API key de Groq inválida. Por favor, verifica tu GROQ_API_KEY en el archivo .env");
    }
    
    // Si es un error de rate limit
    if (error.response?.status === 429) {
      throw new Error("Límite de peticiones alcanzado. Por favor, espera un momento.");
    }
    
    throw error;
  }
}

export const chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({
        response: "Por favor, escribe un mensaje para poder ayudarte.",
      });
    }

    // Limitar longitud del mensaje
    if (message.length > 1000) {
      return res.status(400).json({
        response: "El mensaje es demasiado largo. Por favor, usa menos de 1000 caracteres.",
      });
    }

    let response;
    let errorOccurred = false;

    // Intentar primero con Groq si está configurado (más rápido)
    if (process.env.GROQ_API_KEY) {
      try {
        console.log("Intentando con Groq API...");
        response = await getGroqResponse(message);
        console.log("Groq respondió exitosamente");
      } catch (groqError) {
        console.error("Error con Groq:", groqError.response?.data || groqError.message);
        errorOccurred = true;
        
        // Intentar con Hugging Face como fallback
        try {
          console.log("Intentando con Hugging Face como alternativa...");
          response = await getHuggingFaceResponse(message);
          console.log("Hugging Face respondió exitosamente");
          errorOccurred = false;
        } catch (hfError) {
          console.error("Error con Hugging Face:", hfError.message);
          errorOccurred = true;
        }
      }
    } else {
      // Usar Hugging Face por defecto (gratuita, no requiere API key)
      try {
        console.log("Usando Hugging Face (sin Groq API key)...");
        response = await getHuggingFaceResponse(message);
        console.log("Hugging Face respondió exitosamente");
      } catch (hfError) {
        console.error("Error con Hugging Face:", hfError.message);
        errorOccurred = true;
      }
    }

    // Si hay respuesta, enviarla
    if (response && !errorOccurred) {
      return res.status(200).json({
        response: response,
      });
    }

    // Si llegamos aquí, hubo un error
    throw new Error("No se pudo obtener respuesta de ninguna API");

  } catch (error) {
    console.error("Error general en chat:", error);
    console.error("Stack:", error.stack);

    // Respuesta de fallback más útil
    const fallbackResponse = `Lo siento, estoy teniendo problemas técnicos en este momento. Por favor, intenta de nuevo en unos segundos. Si el problema persiste, puedes reformular tu pregunta de otra manera.

Mientras tanto, puedo decirte que en MiniUdemy tenemos excelentes cursos sobre:
- Desarrollo web (React, JavaScript, Node.js)
- Diseño (UI/UX, Figma, Photoshop)
- Negocios y emprendimiento
- Marketing digital
- Y mucho más

¿Te gustaría que te recomiende algún curso específico?`;

    return res.status(200).json({
      response: fallbackResponse,
    });
  }
};

