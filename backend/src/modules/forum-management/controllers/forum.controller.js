// src/modules/forum-management/controllers/forum.controller.js

import Thread from '../models/forum.model.js';

// Créer un nouveau thread
export const createThread = async (req, res) => {
    try {
        const { title, content, tags } = req.body;
        const thread = await Thread.create({
            title,
            content,
            author: req.user.id, // Assurez-vous que l'utilisateur est authentifié
            tags
        });
        res.status(201).json(thread);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Récupérer tous les threads
export const getThreads = async (req, res) => {
    try {
        const threads = await Thread.find().sort({ createdAt: -1 });
        res.status(200).json(threads);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Récupérer un thread par ID
export const getThreadById = async (req, res) => {
    try {
        const { id } = req.params;
        const thread = await Thread.findById(id).populate('author', 'name').populate('solutions');
        if (!thread) {
            return res.status(404).json({ error: 'Thread non trouvé' });
        }
        res.status(200).json(thread);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Mettre à jour un thread
export const updateThread = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const thread = await Thread.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
        if (!thread) {
            return res.status(404).json({ error: 'Thread non trouvé' });
        }
        res.status(200).json(thread);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Supprimer un thread
export const deleteThread = async (req, res) => {
    try {
        const { id } = req.params;
        const thread = await Thread.findByIdAndDelete(id);
        if (!thread) {
            return res.status(404).json({ error: 'Thread non trouvé' });
        }
        res.status(200).json({ message: 'Thread supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};