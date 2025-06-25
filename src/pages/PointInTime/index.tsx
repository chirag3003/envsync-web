import { useParams } from "react-router-dom";
import { PointInTimeHeader } from "@/components/env-vars/PointInTimeHeader";
import { Button } from "@/components/ui/button";
import { ArrowRight, GitCompare, History, MoreVertical, RotateCcw } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCallback, useState } from "react";
import { CheckDiffModal } from "@/components/env-vars/CheckDiffModal";
import { ViewPitChangesModal } from "@/components/env-vars/ViewPitChangesModal";
import { useNavigate } from "react-router-dom";
import { useProjectEnvironments } from "@/hooks/useProjectEnvironments";
import { PointInTimeLoadingPage } from "./loading";
import { PointInTimeErrorPage } from "./error";

export interface PointInTimeData {
    pit_id: string;
    change_request_message: string;
    user_id: string;
    created_at: string;
    value: string;
    operation: string;
}

// TODO: Mock data - remove this once we have the real data
const staticPitData: PointInTimeData[] = [
    {
        "pit_id": "pit_123",
        "change_request_message": "Updated DATABASE_URL",
        "user_id": "user_123",
        "created_at": "2024-01-01T10:00:00Z",
        "value": "postgresql://localhost:5432/db",
        "operation": "UPDATE"
    },
    {
        "pit_id": "pit_124",
        "change_request_message": "Added new API_KEY",
        "user_id": "user_456",
        "created_at": "2024-01-02T14:30:00Z",
        "value": "sk-1234567890abcdef",
        "operation": "CREATE"
    },
    {
        "pit_id": "pit_125",
        "change_request_message": "Removed deprecated REDIS_URL",
        "user_id": "user_789",
        "created_at": "2024-01-03T09:15:00Z",
        "value": "redis://localhost:6379",
        "operation": "DELETE"
    },
    {
        "pit_id": "pit_126",
        "change_request_message": "Updated JWT_SECRET for security",
        "user_id": "user_123",
        "created_at": "2024-01-04T16:45:00Z",
        "value": "new-secret-key-2024",
        "operation": "UPDATE"
    }
];

export const PointInTime = () => {
    const navigate = useNavigate();
    const { projectNameId, environmentNameId } = useParams();

    const [isCheckDiffModalOpen, setIsCheckDiffModalOpen] = useState(false);
    const [isViewPitChangesModalOpen, setIsViewPitChangesModalOpen] = useState(false);
    const [selectedPitData, setSelectedPitData] = useState<PointInTimeData>(staticPitData[0]);

    const {
        // Data
        project,
        environmentTypes,
        isLoading,
        error,
        refetch,
    } = useProjectEnvironments(projectNameId);

    const handleRetry = useCallback(() => {
        refetch();
    }, [refetch]);

    const onBack = () => navigate("/");

    if (isLoading) {
        return <PointInTimeLoadingPage />;
    }

    if (error) {
        return (
            <PointInTimeErrorPage
                error={error}
                onRetry={handleRetry}
                onBack={() => { navigate(-1) }}
            />
        );
    }

    const handleRollback = (pitData: PointInTimeData) => {
        console.log("Rollback", pitData);
    }

    const handleViewChanges = (pitData: PointInTimeData) => {
        setSelectedPitData(pitData);
        setIsViewPitChangesModalOpen(true);
    }

    const handleCheckDiff = (pitData: PointInTimeData) => {
        setSelectedPitData(pitData);
        setIsCheckDiffModalOpen(true);
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    }

    const getOperationColor = (operation: string) => {
        switch (operation) {
            case 'CREATE':
                return 'text-green-400';
            case 'UPDATE':
                return 'text-blue-400';
            case 'DELETE':
                return 'text-red-400';
            default:
                return 'text-slate-300';
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <PointInTimeHeader
                projectName={project?.name || projectNameId || ""}
                environmentName={environmentNameId || ""}
                environmentTypes={environmentTypes || []}
                canEdit={false}
                isRefetching={false}
                onBack={onBack}
                onRefresh={() => { }}
                onAddVariable={() => { }}
                onBulkImport={() => { }}
                onExport={() => { }}
                onManageEnvironments={() => { }}
                onEnvironmentChange={(envId) => {
                    console.log("Environment changed to:", envId);
                    // Here you could navigate to the new environment or update the data
                }}
            />

            {/* Main PIT Details */}
            <div className="w-full bg-slate-800 p-6 rounded-xl">
                <div className="grid grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-bold text-white">PIT ID</h2>
                        <p className="text-slate-300">{selectedPitData.pit_id}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-bold text-white">Created On</h2>
                        <p className="text-slate-300">{formatDate(selectedPitData.created_at)}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-bold text-white">Created By</h2>
                        <p className="text-slate-300">{selectedPitData.user_id}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-bold text-white">Commit Message</h2>
                        <p className="text-slate-300">{selectedPitData.change_request_message}</p>
                    </div>
                </div>
                <div className="flex justify-end mt-4">
                    <Button className="bg-slate-700 hover:bg-slate-600" onClick={() => handleViewChanges(selectedPitData)}>
                        View Changes
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>

            {/* PIT History List */}
            <div className="w-full bg-slate-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-700">
                    <h3 className="text-lg font-semibold text-white">Point-in-Time History</h3>
                </div>

                {staticPitData.map((pitData) => (
                    <div key={pitData.pit_id} className="flex items-center justify-between p-4 border-b border-slate-700 last:border-b-0 hover:bg-slate-750">
                        <div className="flex-1 grid grid-cols-4 gap-4">
                            <div>
                                <p className="text-white font-medium">{pitData.pit_id}</p>
                            </div>
                            <div>
                                <p className="text-slate-300">{formatDate(pitData.created_at)}</p>
                            </div>
                            <div>
                                <p className="text-slate-300">{pitData.user_id}</p>
                            </div>
                            <div>
                                <p className="text-slate-300">{pitData.change_request_message}</p>
                            </div>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-slate-800 border-slate-700 min-w-[160px]">
                                <DropdownMenuItem onClick={() => handleRollback(pitData)}>
                                    Rollback
                                    <RotateCcw className="w-4 h-4 ml-2" />
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleViewChanges(pitData)}>
                                    View Changelog
                                    <History className="w-4 h-4 ml-2" />
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleCheckDiff(pitData)}>
                                    Check Diff
                                    <GitCompare className="w-4 h-4 ml-2" />
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ))}
            </div>

            <CheckDiffModal
                isOpen={isCheckDiffModalOpen}
                onOpenChange={setIsCheckDiffModalOpen}
                pitData={selectedPitData}
                pitIdList={staticPitData.map((pit) => pit.pit_id)}
            />

            <ViewPitChangesModal
                isOpen={isViewPitChangesModalOpen}
                onOpenChange={setIsViewPitChangesModalOpen}
                pitData={selectedPitData}
            />
        </div>
    )
};