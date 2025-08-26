import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function AlertModal({ open, title, message, onClose }: { open: boolean; title: string; message: string; onClose: () => void }) {
	if (!open) return null;
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
			<Card className="glass-card border-border/50 max-w-md w-full mx-4">
				<CardContent className="p-6">
					<h3 className="text-lg font-semibold mb-2">{title}</h3>
					<p className="text-foreground/80 mb-4 whitespace-pre-wrap">{message}</p>
					<div className="flex justify-end">
						<Button onClick={onClose} variant="default">OK</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
