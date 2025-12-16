import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  description: { 
    type: String, 
    trim: true 
  },
  icon: { 
    type: String, 
    default: "📚" 
  },
  color: { 
    type: String, 
    default: "#6366f1" // Color por defecto (indigo)
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

// Índice para búsquedas rápidas
categorySchema.index({ name: 1 });

export default mongoose.model("Category", categorySchema);


