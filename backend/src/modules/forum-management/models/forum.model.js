// src/modules/forum-management/models/forum.model.js

import mongoose from 'mongoose';

const threadSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    content: {
        type: String,
        required: true,
        minlength: 20,
        maxlength: 5000
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tags: [{
        type: String,
        enum: ['help', 'discussion', 'bug', 'feature']
    }],
    upvotes: {
        type: Number,
        default: 0
    },
    solutions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reply'
    }],
    activity: {
        lastReply: Date,
        replyCount: Number
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            return ret;
        }
    }
});

// Indexation pour la recherche
threadSchema.index({
    title: 'text',
    content: 'text',
    tags: 1
});

// Virtual pour les statistiques
threadSchema.virtual('engagement').get(function() {
    return this.activity.replyCount + this.upvotes * 0.5;
});

export default mongoose.model('Thread', threadSchema);