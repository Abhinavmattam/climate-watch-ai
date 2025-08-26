import { auth, db } from '@/integrations/firebase/client';
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	sendEmailVerification,
	updateProfile,
	User,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export type SignupParams = {
	email: string;
	password: string;
	displayName?: string;
	country?: string;
	city?: string;
};

export type UserProfile = {
	displayName?: string;
	email: string;
	country?: string;
	city?: string;
};

export async function signUpWithEmail(params: SignupParams): Promise<void> {
	const { email, password, displayName, country, city } = params;
	const userCredential = await createUserWithEmailAndPassword(auth, email, password);
	const user = userCredential.user;
	if (displayName) {
		await updateProfile(user, { displayName });
	}
	await setDoc(doc(db, 'users', user.uid), {
		email: user.email,
		displayName: displayName ?? null,
		country: country ?? null,
		city: city ?? null,
		createdAt: Date.now(),
	});
	await sendEmailVerification(user);
	await signOut(auth);
}

export async function loginWithEmail(email: string, password: string): Promise<User> {
	const { user } = await signInWithEmailAndPassword(auth, email, password);
	if (!user.emailVerified) {
		try { await sendEmailVerification(user); } catch { /* ignore resend errors */ }
		await signOut(auth);
		const error = new Error('Please verify your email before logging in.');
		(error as any).code = 'auth/email-not-verified';
		throw error;
	}
	return user;
}

export function isUserEmailVerified(user: User | null | undefined): boolean {
	return !!user?.emailVerified;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
	const snapshot = await getDoc(doc(db, 'users', uid));
	if (!snapshot.exists()) return null;
	return snapshot.data() as UserProfile;
}
