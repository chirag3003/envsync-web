import { useParams } from "react-router-dom";
import { PointInTimeHeader } from "@/components/env-vars/PointInTimeHeader";
import { Button } from "@/components/ui/button";
import { ArrowRight, GitCompare, History, MoreVertical, RotateCcw, Clock, User, Calendar, MessageSquare, Eye, GitBranch } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCallback, useState } from "react";
import { CheckDiffModal } from "@/components/env-vars/CheckDiffModal";
import { ViewPitChangesModal } from "@/components/env-vars/ViewPitChangesModal";
import { useNavigate } from "react-router-dom";
import { useProjectEnvironments } from "@/hooks/useProjectEnvironments";
import { PointInTimeLoadingPage } from "./loading";
import { PointInTimeErrorPage } from "./error";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
        "change_request_message": "Updated DATABASE_URL for production optimization",
        "user_id": "john.doe@company.com",
        "created_at": "2024-01-01T10:00:00Z",
        "value": "postgresql://localhost:5432/db",
        "operation": "UPDATE"
    },
    {
        "pit_id": "pit_124",
        "change_request_message": "Added new API_KEY for third-party integration",
        "user_id": "jane.smith@company.com",
        "created_at": "2024-01-02T14:30:00Z",
        "value": "sk-1234567890abcdef",
        "operation": "CREATE"
    },
    {
        "pit_id": "pit_125",
        "change_request_message": "Removed deprecated REDIS_URL configuration",
        "user_id": "mike.wilson@company.com",
        "created_at": "2024-01-03T09:15:00Z",
        "value": "redis://localhost:6379",
        "operation": "DELETE"
    },
    {
        "pit_id": "pit_126",
        "change_request_message": "Updated JWT_SECRET for enhanced security compliance",
        "user_id": "sarah.johnson@company.com",
        "created_at": "2024-01-04T16:45:00Z",
        "value": "new-secret-key-2024",
        "operation": "UPDATE"
    }
];

const PointInTime = () => {
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
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            }),
            time: date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            })
        };
    }

    const getOperationColor = (operation: string) => {
        switch (operation) {
            case 'CREATE':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'UPDATE':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'DELETE':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            default:
                return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
        }
    }

    const getOperationIcon = (operation: string) => {
        switch (operation) {
            case 'CREATE':
                return <GitBranch className="w-3 h-3" />;
            case 'UPDATE':
                return <Clock className="w-3 h-3" />;
            case 'DELETE':
                return <RotateCcw className="w-3 h-3" />;
            default:
                return <Clock className="w-3 h-3" />;
        }
    }

    return (
        <div className="flex flex-col gap-6 p-6">
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

            {/* Current PIT Overview Card */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-xl">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Clock className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">Current Point in Time</h2>
                                <p className="text-slate-400 text-sm">Latest snapshot details</p>
                            </div>
                        </div>
                        <Badge className={`${getOperationColor(selectedPitData.operation)} border font-medium`}>
                            {getOperationIcon(selectedPitData.operation)}
                            {selectedPitData.operation}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <GitBranch className="w-4 h-4" />
                                PIT ID
                            </div>
                            <p className="text-white font-mono text-sm bg-slate-700/50 px-3 py-2 rounded-md">
                                {selectedPitData.pit_id}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <Calendar className="w-4 h-4" />
                                Created On
                            </div>
                            <div className="text-white">
                                <p className="font-medium">{formatDate(selectedPitData.created_at).date}</p>
                                <p className="text-slate-400 text-sm">{formatDate(selectedPitData.created_at).time}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <User className="w-4 h-4" />
                                Created By
                            </div>
                            <p className="text-white font-medium">{selectedPitData.user_id}</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <MessageSquare className="w-4 h-4" />
                                Commit Message
                            </div>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                {selectedPitData.change_request_message}
                            </p>
                        </div>
                    </div>
                    
                    <Separator className="bg-slate-700" />
                    
                    <div className="flex justify-end">
                        <Button 
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg" 
                            onClick={() => handleViewChanges(selectedPitData)}
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            View Changes
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* PIT History Timeline */}
            <Card className="bg-slate-800 border-slate-700 shadow-lg">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <History className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Point-in-Time History</h3>
                                <p className="text-slate-400 text-sm">Complete timeline of environment changes</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="text-slate-300 border-slate-600">
                            {staticPitData.length} snapshots
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="space-y-0">
                        {staticPitData.map((pitData, index) => {
                            const dateTime = formatDate(pitData.created_at);
                            const isSelected = selectedPitData.pit_id === pitData.pit_id;
                            
                            return (
                                <div 
                                    key={pitData.pit_id} 
                                    className={`relative flex items-center p-6 border-b border-slate-700 last:border-b-0 transition-all duration-200 ${
                                        isSelected 
                                            ? 'bg-blue-500/10 border-l-4 border-l-blue-500' 
                                            : 'hover:bg-slate-750 cursor-pointer'
                                    }`}
                                    onClick={() => setSelectedPitData(pitData)}
                                >
                                    {/* Timeline indicator */}
                                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-transparent via-slate-600 to-transparent"></div>
                                    
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                        {/* PIT ID & Operation */}
                                        <div className="md:col-span-3 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <code className="text-white font-mono text-sm bg-slate-700/50 px-2 py-1 rounded">
                                                    {pitData.pit_id}
                                                </code>
                                                <Badge className={`${getOperationColor(pitData.operation)} border text-xs`}>
                                                    {getOperationIcon(pitData.operation)}
                                                    {pitData.operation}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Date & Time */}
                                        <div className="md:col-span-2 space-y-1">
                                            <p className="text-white font-medium text-sm">{dateTime.date}</p>
                                            <p className="text-slate-400 text-xs">{dateTime.time}</p>
                                        </div>

                                        {/* User */}
                                        <div className="md:col-span-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                                    {pitData.user_id.charAt(0).toUpperCase()}
                                                </div>
                                                <p className="text-slate-300 text-sm truncate">{pitData.user_id}</p>
                                            </div>
                                        </div>

                                        {/* Message */}
                                        <div className="md:col-span-4">
                                            <p className="text-slate-300 text-sm line-clamp-2 leading-relaxed">
                                                {pitData.change_request_message}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="md:col-span-1 flex justify-end">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-8 w-8 p-0 hover:bg-slate-600 text-slate-400 hover:text-white"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="bg-slate-800 border-slate-700 min-w-[180px]" align="end">
                                                    <DropdownMenuItem 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRollback(pitData);
                                                        }}
                                                        className="text-white hover:bg-slate-700 cursor-pointer"
                                                    >
                                                        <RotateCcw className="w-4 h-4 mr-2 text-orange-400" />
                                                        Rollback to this PIT
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewChanges(pitData);
                                                        }}
                                                        className="text-white hover:bg-slate-700 cursor-pointer"
                                                    >
                                                        <History className="w-4 h-4 mr-2 text-blue-400" />
                                                        View Changelog
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCheckDiff(pitData);
                                                        }}
                                                        className="text-white hover:bg-slate-700 cursor-pointer"
                                                    >
                                                        <GitCompare className="w-4 h-4 mr-2 text-green-400" />
                                                        Compare Changes
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    {/* Selection indicator */}
                                    {isSelected && (
                                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Modals */}
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

export default PointInTime;
