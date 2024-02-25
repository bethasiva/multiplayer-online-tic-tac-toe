import { Router } from "express";
import {
	home,
	invalid,
	signInController,
	signUpController,
	isUserAuthenticated,
	logoutController,
} from "../controllers";
import { validateForm } from "../utils";

const router = Router();

router.get("/", isUserAuthenticated, home);
router.get("/logout", logoutController);

router
	.route("/signin")
	.get(isUserAuthenticated, signInController)
	.post(validateForm(["username", "password"]), signInController);

router
	.route("/signup")
	.get(isUserAuthenticated, signUpController)
	.post(validateForm(["username", "password", "confirm_password"]), signUpController);
	
router.use(invalid);

export default router;
