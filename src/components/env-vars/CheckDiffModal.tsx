import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { GitCompare, Plus, Minus, Edit, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { PointInTimeData } from "@/pages/PointInTime";
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from "../ui/select";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";

interface DiffResults {
    added: Array<{
        key: string;
        value: string;
    }>;
    modified: Array<{
        key: string;
        old_value: string;
        new_value: string;
    }>;
    deleted: Array<{
        key: string;
        value: string;
    }>;
}

interface CheckDiffModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    pitData: PointInTimeData;
    pitIdList: string[];
}

export const CheckDiffModal = ({ isOpen, onOpenChange, pitData, pitIdList }: CheckDiffModalProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fromPitId, setFromPitId] = useState<string>(pitData.pit_id);
    const [toPitId, setToPitId] = useState<string>(pitData.pit_id);
    const [diffResults, setDiffResults] = useState<DiffResults | null>(null);

    const handleCheckDiff = async () => {
        if (!fromPitId || !toPitId) {
            setError("Please select both Before and After PIT IDs");
            return;
        }

        if (fromPitId === toPitId) {
            setError("Before and After PIT IDs cannot be the same");
            return;
        }

        setIsLoading(true);
        setError(null);

        // Simulate loading delay
        setTimeout(() => {
            // TODO: mock data - remove this once we have the real data
            const staticDiffResults: DiffResults = {
                added: [
                    { key: "NEW_VAR", value: "new_value" },
                    { key: "JWT_SECRET", value: "super_secret_token_2024" }
                ],
                modified: [
                    { key: "DATABASE_URL", old_value: "postgres://old-host:5432/db", new_value: "postgres://new-host:5432/db" },
                    { key: "API_SECRET", old_value: "old_secret_123", new_value: "new_secret_456" }
                ],
                deleted: [
                    { key: "REMOVED_VAR", value: "removed_value" },
                    { key: "DEPRECATED_CONFIG", value: "old_config_value" }
                ]
            };

            setDiffResults(staticDiffResults);
            setIsLoading(false);
        }, 1000);
    };

    const getChangeIcon = (type: 'added' | 'modified' | 'deleted') => {
        switch (type) {
            case 'added':
                return <Plus className="w-4 h-4 text-green-400" />;
            case 'modified':
                return <Edit className="w-4 h-4 text-blue-400" />;
            case 'deleted':
                return <Minus className="w-4 h-4 text-red-400" />;
        }
    };

    const getChangeBadge = (type: 'added' | 'modified' | 'deleted') => {
        const variants = {
            added: "bg-green-900 text-green-200 hover:bg-green-800",
            modified: "bg-blue-900 text-blue-200 hover:bg-blue-800",
            deleted: "bg-red-900 text-red-200 hover:bg-red-800"
        };

        return (
            <Badge className={`${variants[type]} capitalize`}>
                {getChangeIcon(type)}
                {type}
            </Badge>
        );
    };

    // Combine all changes into a single array for display
    const allChanges = diffResults ? [
        ...diffResults.added.map(item => ({ type: 'added' as const, ...item, old_value: undefined, new_value: item.value })),
        ...diffResults.modified.map(item => ({ type: 'modified' as const, ...item, value: undefined })),
        ...diffResults.deleted.map(item => ({ type: 'deleted' as const, ...item, old_value: item.value, new_value: undefined }))
    ] : [];

    const resetModal = () => {
        setDiffResults(null);
        setError(null);
        setFromPitId(pitData.pit_id);
        setToPitId(pitData.pit_id);
    };

    // Check if both selectors have the same value initially
    const showNoDiffMessage = !diffResults && !isLoading && fromPitId === toPitId;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) resetModal();
            onOpenChange(open);
        }}>
            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-5xl">
                <DialogHeader>
                    <DialogTitle className="text-white text-xl">Check Diff Between PITs</DialogTitle>
                    <DialogDescription className="text-slate-300">
                        Compare changes between two point-in-time snapshots.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="grid grid-cols-3 items-end gap-4">
                        <div className="space-y-2">
                            <Label className="text-slate-300">Before PIT ID</Label>
                            <Select value={fromPitId} onValueChange={setFromPitId} disabled>
                                <SelectTrigger className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400">
                                    <SelectValue placeholder="Select Before PIT ID" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                    {pitIdList.map((pitId) => (
                                        <SelectItem key={pitId} value={pitId}>{pitId}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-300">After PIT ID</Label>
                            <Select value={toPitId} onValueChange={setToPitId}>
                                <SelectTrigger className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400">
                                    <SelectValue placeholder="Select After PIT ID" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                    {pitIdList.filter(id => id !== fromPitId).map((pitId) => (
                                        <SelectItem key={pitId} value={pitId}>{pitId}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            onClick={handleCheckDiff}
                            disabled={isLoading || !fromPitId || !toPitId || fromPitId === toPitId}
                            className="bg-slate-700 hover:bg-slate-600 flex items-center gap-2 text-white"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitCompare className="w-4 h-4" />}
                            Compare PITs
                        </Button>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
                            <p className="text-red-200">{error}</p>
                        </div>
                    )}

                    {showNoDiffMessage && (
                        <div className="p-8 text-center">
                            <p className="text-slate-400 text-lg">Select a different PIT ID to compare changes</p>
                        </div>
                    )}

                    {diffResults && (
                        <>
                            <div className="border border-slate-600 rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-slate-600 hover:bg-slate-750">
                                            <TableHead className="text-slate-300 font-medium">Change</TableHead>
                                            <TableHead className="text-slate-300 font-medium">Key</TableHead>
                                            <TableHead className="text-slate-300 font-medium">Before</TableHead>
                                            <TableHead className="text-slate-300 font-medium">After</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {allChanges.map((change, index) => (
                                            <TableRow
                                                key={index}
                                                className="border-slate-600 hover:bg-slate-750"
                                            >
                                                <TableCell className="w-24">
                                                    {getChangeBadge(change.type)}
                                                </TableCell>
                                                <TableCell className="text-white font-medium">{change.key}</TableCell>
                                                <TableCell className="text-slate-300 break-all max-w-xs">
                                                    {change.old_value || '—'}
                                                </TableCell>
                                                <TableCell className="text-slate-300 break-all max-w-xs">
                                                    {change.new_value || '—'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {allChanges.length === 0 && (
                                            <TableRow className="border-slate-600">
                                                <TableCell colSpan={4} className="text-center text-slate-400 py-8">
                                                    No changes found between the selected PITs
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};