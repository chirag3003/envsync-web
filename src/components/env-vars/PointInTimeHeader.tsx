import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ArrowLeft,
    Plus,
    RefreshCw,
    Upload,
    Download,
    Settings, 
    ChevronDown,
    Shield, 
    MoreVertical,
    Clock,
    Database
} from "lucide-react";
import { EnvironmentType } from "@/constants";
import { Card, CardContent } from "@/components/ui/card";

interface PointInTimeHeaderProps {
    projectName: string;
    environmentName?: string;
    environmentTypes: EnvironmentType[];
    canEdit: boolean;
    isRefetching: boolean;
    onBack: () => void;
    onRefresh: () => void;
    onAddVariable: () => void;
    onBulkImport: () => void;
    onExport: () => void;
    onManageEnvironments: () => void;
    onEnvironmentChange?: (environmentId: string) => void;
}

export const PointInTimeHeader = ({
    projectName,
    environmentName = "",
    environmentTypes = [],
    canEdit,
    isRefetching,
    onBack,
    onRefresh,
    onAddVariable,
    onBulkImport,
    onExport,
    onManageEnvironments,
    onEnvironmentChange,
}: PointInTimeHeaderProps) => {
    const navigate = useNavigate();
    const { projectNameId } = useParams();
    const location = useLocation();

    const [selectedEnvironment, setSelectedEnvironment] = useState<string>(
        environmentTypes.find(env => env.name.toLowerCase() === environmentName.toLowerCase())?.id ||
        environmentTypes.find(env => env.is_default)?.id ||
        environmentTypes[0]?.id || ""
    );

    // Determine current section based on route
    const isSecretsPage = location.pathname.includes('/secrets');
    const currentSection = isSecretsPage ? 'Secrets' : 'Environments';

    const handleSectionChange = (section: 'environments' | 'secrets') => {
        if (!projectNameId) return;

        const basePath = `/applications/pit/${projectNameId}/environments`;
        const targetPath = section === 'secrets' ? `${basePath}/secrets` : basePath;

        navigate(targetPath);
    };

    const handleEnvironmentChange = (envId: string) => {
        setSelectedEnvironment(envId);
        onEnvironmentChange?.(envId);
    };

    const getEnvironmentColor = (color: string) => {
        const colors: { [key: string]: string } = {
            red: "bg-red-500",
            yellow: "bg-yellow-500",
            blue: "bg-blue-500",
            green: "bg-green-500",
            purple: "bg-purple-500",
            orange: "bg-orange-500"
        };
        return colors[color] || "bg-slate-500";
    };

    const selectedEnvData = environmentTypes.find(env => env.id === selectedEnvironment);

    return (
        <div className="space-y-6">
            {/* Enhanced Navigation Breadcrumb */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                        <Button
                            onClick={onBack}
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                            <ArrowLeft className="size-4 mr-2" />
                            Back to Projects
                        </Button>
                        <div className="flex items-center space-x-2 text-slate-500">
                            <span>/</span>
                            <Database className="w-4 h-4" />
                        </div>
                        <span className="text-slate-300 font-medium">{projectName}</span>
                        <span className="text-slate-500">/</span>

                        {/* Enhanced Section Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-white font-medium hover:bg-slate-700 px-4 py-2 h-auto border border-slate-600 hover:border-slate-500 transition-all"
                                >
                                    <div className="flex items-center gap-2">
                                        {isSecretsPage ? (
                                            <Shield className="w-4 h-4 text-red-400" />
                                        ) : (
                                            <Clock className="w-4 h-4 text-blue-400" />
                                        )}
                                        <span>{currentSection} PIT</span>
                                        <ChevronDown className="w-4 h-4 ml-1" />
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="bg-slate-800 border-slate-700 min-w-[250px] shadow-xl"
                                align="start"
                            >
                                <DropdownMenuItem
                                    onClick={() => handleSectionChange('environments')}
                                    className={`text-white hover:bg-slate-700 cursor-pointer p-4 ${!isSecretsPage ? 'bg-slate-700/50' : ''
                                        }`}
                                >
                                    <Clock className="w-5 h-5 mr-3 text-blue-400" />
                                    <div className="flex flex-col">
                                        <span className="font-medium">Environment Variables</span>
                                        <span className="text-xs text-slate-400">
                                            View point-in-time snapshots of environment variables
                                        </span>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleSectionChange('secrets')}
                                    className={`text-white hover:bg-slate-700 cursor-pointer p-4 ${isSecretsPage ? 'bg-slate-700/50' : ''
                                        }`}
                                >
                                    <Shield className="w-5 h-5 mr-3 text-red-400" />
                                    <div className="flex flex-col">
                                        <span className="font-medium">Secrets</span>
                                        <span className="text-xs text-slate-400">
                                            View point-in-time snapshots of secret values
                                        </span>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>

            {/* Enhanced Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-xl">
                                <Clock className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">{projectName}</h1>
                                <p className="text-slate-400 text-lg">
                                    {isSecretsPage
                                        ? "Point-in-time snapshots for secrets"
                                        : "Point-in-time snapshots for environment variables"
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Environment Type Selector */}
                    <Card className="bg-slate-800/30 border-slate-700">
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-4">
                                <span className="text-slate-300 text-sm font-medium min-w-fit">Environment:</span>
                                <Select value={selectedEnvironment} onValueChange={handleEnvironmentChange}>
                                    <SelectTrigger className="w-64 bg-slate-700 border-slate-600 text-white hover:bg-slate-600 transition-colors">
                                        <SelectValue>
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-3 h-3 rounded-full ${getEnvironmentColor(selectedEnvData?.color || 'slate')}`} />
                                                <span className="font-medium">{selectedEnvData?.name}</span>
                                                {selectedEnvData?.is_protected && (
                                                    <Shield className="w-3 h-3 text-red-400" />
                                                )}
                                                {selectedEnvData?.is_default && (
                                                    <Badge className="bg-blue-600 text-blue-100 text-xs px-2 py-0.5">
                                                        Default
                                                    </Badge>
                                                )}
                                            </div>
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700 shadow-xl">
                                        {environmentTypes.map((env) => (
                                            <SelectItem 
                                                key={env.id} 
                                                value={env.id} 
                                                className="text-white hover:bg-slate-700 p-3"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-3 h-3 rounded-full ${getEnvironmentColor(env.color)}`} />
                                                    <span className="font-medium">{env.name}</span>
                                                    {env.is_protected && (
                                                        <Shield className="w-3 h-3 text-red-400" />
                                                    )}
                                                    {env.is_default && (
                                                        <Badge className="bg-blue-600 text-blue-100 text-xs px-2 py-0.5">
                                                            Default
                                                        </Badge>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Enhanced Actions */}
                <div className="flex items-center space-x-3">
                    {/* Quick Actions */}
                    <div className="flex items-center space-x-2">
                        <Button
                            onClick={onRefresh}
                            variant="outline"
                            size="sm"
                            disabled={isRefetching}
                            className="text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white transition-colors"
                        >
                            <RefreshCw
                                className={`w-4 h-4 mr-2 ${isRefetching ? "animate-spin" : ""}`}
                            />
                            Refresh
                        </Button>

                        <Button
                            onClick={onExport}
                            variant="outline"
                            size="sm"
                            className="text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white transition-colors"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                    </div>

                    {/* More Options Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-slate-400 border-slate-600 hover:bg-slate-700 hover:text-white transition-colors"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="bg-slate-800 border-slate-700 min-w-[180px] shadow-xl"
                            align="end"
                        >
                            {canEdit && (
                                <>
                                    <DropdownMenuItem
                                        onClick={onBulkImport}
                                        className="text-white hover:bg-slate-700 cursor-pointer p-3"
                                    >
                                        <Upload className="w-4 h-4 mr-3 text-green-400" />
                                        Bulk Import
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={onAddVariable}
                                        className="text-white hover:bg-slate-700 cursor-pointer p-3"
                                    >
                                        {isSecretsPage ? (
                                            <>
                                                <Shield className="w-4 h-4 mr-3 text-red-400" />
                                                Add Secret
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-4 h-4 mr-3 text-emerald-400" />
                                                Add Variable
                                            </>
                                        )}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={onManageEnvironments}
                                        className="text-white hover:bg-slate-700 cursor-pointer p-3"
                                    >
                                        <Settings className="w-4 h-4 mr-3 text-blue-400" />
                                        Manage Environments
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
};
