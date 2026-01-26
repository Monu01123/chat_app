import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  deleteGroup,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.route("/").post(protectRoute, accessChat);
router.route("/").get(protectRoute, fetchChats);
router.route("/group").post(protectRoute, createGroupChat);
router.route("/rename").put(protectRoute, renameGroup);
router.route("/groupremove").put(protectRoute, removeFromGroup);
router.route("/groupadd").put(protectRoute, addToGroup);
router.route("/group/:id").delete(protectRoute, deleteGroup);

export default router;
