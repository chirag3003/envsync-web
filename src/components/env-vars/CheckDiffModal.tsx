import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { GitCompare, Plus, Minus, Edit, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { PointInTimeData } from "@/pages/PointInTime";
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from "../ui/select";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";

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
                    { key: "NEW_API_ENDPOINT", value: "https://api.newservice.com/v1" },
                    { key: "JWT_SECRET", value: "super_secret_token_2024" },
                    { key: "FEATURE_FLAG_NEW_UI", value: "true" }
                ],
                modified: [
                    { key: "DATABASE_URL", old_value: "postgres://old-host:5432/db", new_value: "postgres://new-host:5432/db" },
                    { key: "API_SECRET", old_value: "old_secret_123", new_value: "new_secret_456" },
                    { key: "REDIS_TTL", old_value: "3600", new_value: "7200" }
                ],
                deleted: [
                    { key: "DEPRECATED_SERVICE_URL", value: "https://old-service.com/api" },
                    { key: "LEGACY_CONFIG", value: "old_config_value" }
                ]
            };

            setDiffResults(staticDiffResults);
            setIsLoading(false);
        }, 1500);
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
            added: "bg-green-500/20 text-green-300 border-green-500/30",
            modified: "bg-blue-500/20 text-blue-300 border-blue-500/30",
            deleted: "bg-red-500/20 text-red-300 border-red-500/30"
        };

        return (
            <Badge className={`${variants[type]} border font-medium px-3 py-1`}>
                {getChangeIcon(type)}
                <span className="ml-1 capitalize">{type}</span>
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

    const showNoDiffMessage = !diffResults && !isLoading && fromPitId === toPitId;

    const totalChanges = diffResults ? 
        diffResults.added.length + diffResults.modified.length + diffResults.deleted.length : 0;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) resetModal();
            onOpenChange(open);
        }}>
            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="pb-4">
                    <DialogTitle className="text-white text-2xl flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <GitCompare className="w-6 h-6 text-blue-400" />
                        </div>
                        Compare Point-in-Time Snapshots
                    </DialogTitle>
                    <DialogDescription className="text-slate-300 text-base">
                        Compare changes between two point-in-time snapshots to see what has been added, modified, or removed.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 flex-1 overflow-hidden flex flex-col">
                    {/* Selection Controls */}
                    <Card className="bg-slate-700/30 border-slate-600">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 items-end gap-6">
                                <div className="space-y-3">
                                    <Label className="text-slate-300 font-medium">Before (Source)</Label>
                                    <Select value={fromPitId} onValueChange={setFromPitId}>
                                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-12">
                                            <SelectValue placeholder="Select Before PIT ID" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                            {pitIdList.map((pitId) => (
                                                <SelectItem key={pitId} value={pitId} className="py-3">
                                                    <code className="font-mono">{pitId}</code>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex justify-center items-end pb-2">
                                    <div className="p-3 bg-slate-600 rounded-full">
                                        <ArrowRight className="w-5 h-5 text-slate-300" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-slate-300 font-medium">After (Target)</Label>
                                    <Select value={toPitId} onValueChange={setToPitId}>
                                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-12">
                                            <SelectValue placeholder="Select After PIT ID" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                            {pitIdList.filter(id => id !== fromPitId).map((pitId) => (
                                                <SelectItem key={pitId} value={pitId} className="py-3">
                                                    <code className="font-mono">{pitId}</code>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex justify-center mt-6">
                                <Button
                                    onClick={handleCheckDiff}
                                    disabled={isLoading || !fromPitId || !toPitId || fromPitId === toPitId}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 h-auto font-medium shadow-lg"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Comparing...
                                        </>
                                    ) : (
                                        <>
                                            <GitCompare className="w-5 h-5 mr-2" />
                                            Compare PITs
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Error State */}
                    {error && (
                        <Card className="bg-red-500/10 border-red-500/30">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                    <p className="text-red-200 font-medium">{error}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* No Diff Message */}
                    {showNoDiffMessage && (
                        <Card className="bg-slate-700/30 border-slate-600">
                            <CardContent className="p-12 text-center">
                                <GitCompare className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                                <p className="text-slate-400 text-lg font-medium mb-2">Ready to Compare</p>
                                <p className="text-slate-500">Select different PIT IDs to see the changes between them</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Results */}
                    {diffResults && (
                        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
                            {/* Summary */}
                            <Card className="bg-slate-700/30 border-slate-600">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg text-white flex items-center justify-between">
                                        <span>Comparison Summary</span>
                                        <Badge variant="outline" className="text-slate-300 border-slate-500">
                                            {totalChanges} total changes
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                                            <div className="text-2xl font-bold text-green-400">{diffResults.added.length}</div>
                                            <div className="text-sm text-green-300">Added</div>
                                        </div>
                                        <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                            <div className="text-2xl font-bold text-blue-400">{diffResults.modified.length}</div>
                                            <div className="text-sm text-blue-300">Modified</div>
                                        </div>
                                        <div className="text-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                                            <div className="text-2xl font-bold text-red-400">{diffResults.deleted.length}</div>
                                            <div className="text-sm text-red-300">Deleted</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Changes Table */}
                            <Card className="flex-1 overflow-hidden border-slate-600">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg text-white">Detailed Changes</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 flex-1 overflow-hidden">
                                    <div className="overflow-auto max-h-96">
                                        <Table>
                                            <TableHeader className="sticky top-0 bg-slate-800 z-10">
                                                <TableRow className="border-slate-600 hover:bg-slate-750">
                                                    <TableHead className="text-slate-300 font-semibold w-32">Change Type</TableHead>
                                                    <TableHead className="text-slate-300 font-semibold w-48">Variable Key</TableHead>
                                                    <TableHead className="text-slate-300 font-semibold">Before Value</TableHead>
                                                    <TableHead className="text-slate-300 font-semibold">After Value</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {allChanges.map((change, index) => (
                                                    <TableRow
                                                        key={index}
                                                        className="border-slate-600 hover:bg-slate-750/50 transition-colors"
                                                    >
                                                        <TableCell className="py-4">
                                                            {getChangeBadge(change.type)}
                                                        </TableCell>
                                                        <TableCell className="py-4">
                                                            <code className="text-white font-mono text-sm bg-slate-700/50 px-2 py-1 rounded">
                                                                {change.key}
                                                            </code>
                                                        </TableCell>
                                                        <TableCell className="py-4 max-w-xs">
                                                            {change.old_value ? (
                                                                <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
                                                                    <code className="text-red-200 text-sm break-all">
                                                                        {change.old_value}
                                                                    </code>
                                                                </div>
                                                            ) : (
                                                                <span className="text-slate-500 italic">—</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="py-4 max-w-xs">
                                                            {change.new_value ? (
                                                                <div className="bg-green-500/10 border border-green-500/20 rounded p-2">
                                                                    <code className="text-green-200 text-sm break-all">
                                                                        {change.new_value}
                                                                    </code>
                                                                </div>
                                                            ) : (
                                                                <span className="text-slate-500 italic">—</span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {allChanges.length === 0 && (
                                                    <TableRow className="border-slate-600">
                                                        <TableCell colSpan={4} className="text-center text-slate-400 py-12">
                                                            <div className="flex flex-col items-center gap-3">
                                                                <GitCompare className="w-12 h-12 text-slate-500" />
                                                                <div>
                                                                    <p className="font-medium">No Changes Found</p>
                                                                    <p className="text-sm">The selected PITs are identical</p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
