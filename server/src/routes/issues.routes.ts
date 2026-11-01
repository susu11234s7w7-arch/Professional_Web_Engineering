import { Router } from 'express';
import { getIssueById, updateIssue, deleteIssue } from '../controllers/issues.controller.js';
import { addComment, listComments } from '../controllers/comments.controller.js';
import { getIssueActivity } from '../controllers/activity.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { updateIssueSchema, createCommentSchema } from '../validators/schemas.js';

const router = Router();

router.use(authenticate);

router.get('/:id', getIssueById);
router.patch('/:id', validate({ body: updateIssueSchema }), updateIssue);
router.delete('/:id', deleteIssue);

// Issue comments & activity
router.get('/:issueId/comments', listComments);
router.post('/:issueId/comments', validate({ body: createCommentSchema }), addComment);
router.get('/:issueId/activity', getIssueActivity);

export default router;

