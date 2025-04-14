// src/modules/formation-certification/models/formation.model.js

import mongoose from 'mongoose';

const formationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 50,
    maxlength: 2000
  },
  category: {
    type: String,
    enum: ['development', 'ai', 'project_management'],
    required: true
  },
  duration: {
    hours: { type: Number, min: 1 },
    weeks: { type: Number, min: 1 }
  },
  content: {
    videos: [{
      url: String,
      duration: Number,
      title: String
    }],
    documents: [{
      url: String,
      type: { type: String, enum: ['pdf', 'markdown'] }
    }],
    quizzes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz'
    }]
  },
  certifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certification'
  }]
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexation pour la recherche full-text
formationSchema.index({
  title: 'text',
  description: 'text',
  'content.videos.title': 'text'
});

export default mongoose.model('Formation', formationSchema);