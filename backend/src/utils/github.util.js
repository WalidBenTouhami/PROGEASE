// src/utils/github.util.js

import axios from 'axios';
import { logger } from './logger.js';

const GITHUB_API = 'https://api.github.com';

export class GitHubService {
    constructor(token) {
        this.client = axios.create({
            baseURL: GITHUB_API,
            headers: {
                Authorization: `token ${token}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });
    }

    async getRepoDetails(repoUrl) {
        try {
            const [owner, repo] = this.parseRepoUrl(repoUrl);
            const { data } = await this.client.get(`/repos/${owner}/${repo}`);

            return {
                stars: data.stargazers_count,
                forks: data.forks_count,
                issues: data.open_issues_count,
                lastCommit: new Date(data.pushed_at)
            };
        } catch (error) {
            logger.error(`GitHub API Error: ${error.response?.status}`);
            throw error;
        }
    }

    async checkCollaborator(repoUrl, username) {
        const [owner, repo] = this.parseRepoUrl(repoUrl);
        try {
            await this.client.get(`/repos/${owner}/${repo}/collaborators/${username}`);
            return true;
        } catch (error) {
            return false;
        }
    }

    parseRepoUrl(url) {
        const match = url.match(/github.com\/([^/]+)\/([^/]+)/);
        if (!match) throw new Error('URL GitHub invalide');
        return [match[1], match[2]];
    }
}