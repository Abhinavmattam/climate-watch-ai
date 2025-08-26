import { Button } from '@/components/ui/button';

export function RefreshButton({ onClick, updatedAt, loading }: { onClick: () => void; updatedAt: number | null; loading?: boolean }) {
	return (
		<div className="flex items-center gap-3">
			<Button onClick={onClick} disabled={loading} variant="outline">
				{loading ? 'Refreshing…' : 'Refresh'}
			</Button>
			{updatedAt && (
				<span className="text-xs text-foreground/70">Updated {new Date(updatedAt).toLocaleTimeString()}</span>
			)}
		</div>
	);
}
