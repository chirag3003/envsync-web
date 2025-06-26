import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PointInTimeData } from "@/pages/PointInTime";

interface ViewPitChangesModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    pitData: PointInTimeData;
}

export const ViewPitChangesModal = ({ isOpen, onOpenChange, pitData }: ViewPitChangesModalProps) => {

    // TODO: mock data - remove this once we have the real data
    const changes = [
        { key: "DATABASE_URL", operation: "UPDATE" },
        { key: "API_SECRET", operation: "DELETE" },
        { key: "REDIS_HOST", operation: "CREATE" }
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-white text-xl">View PIT Changes</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-6">
                    {changes.map((change, index) => (
                        <div
                            key={index}
                            className="border border-slate-600 rounded-lg p-4 bg-slate-750"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-slate-300 text-sm mb-1">Key</div>
                                    <div className="text-white font-medium">{change.key}</div>
                                </div>
                                <div>
                                    <div className="text-slate-300 text-sm mb-1">Operation</div>
                                    <div className="text-white font-medium">{change.operation}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}   