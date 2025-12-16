import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  lastActivity: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  deviceInfo: {
    type: String,
    default: null
  }
}, { 
  timestamps: true 
});

// Índice compuesto para búsquedas rápidas
sessionSchema.index({ user: 1, isActive: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index para auto-eliminación

// Método para verificar si la sesión está activa y no expirada
sessionSchema.methods.isValid = function() {
  return this.isActive && this.expiresAt > new Date();
};

// Método para actualizar la última actividad
sessionSchema.methods.updateActivity = async function() {
  this.lastActivity = new Date();
  await this.save();
};

export default mongoose.model("Session", sessionSchema);

