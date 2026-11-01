import { Router } from 'express';
import { listProjects, createProject, getProjectById, deleteProject } from '../controllers/projects.controller.js';
import { listIssues, createIssue } from '../controllers/issues.controller.js';
import { getProjectActivity } from '../controllers/activity.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { createProjectSchema, createIssueSchema } from '../validators/schemas.js';

const router = Router();

router.use(authenticate);

router.get('/', listProjects);
router.post('/', validate({ body: createProjectSchema }), createProject);
router.get('/:id', getProjectById);
router.delete('/:id', deleteProject);

// Nested issue routes for project
router.get('/:projectId/issues', listIssues);
router.post('/:projectId/issues', validate({ body: createIssueSchema }), createIssue);
router.get('/:projectId/activity', getProjectActivity);

export default router;
