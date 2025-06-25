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
    Settings, ChevronDown,
    Shield, MoreVertical
} from "lucide-react";
import { EnvironmentType } from "@/constants";


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
            {/* Navigation */}
            <div className="flex items-center space-x-3">
                <Button
                    onClick={onBack}
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white hover:bg-slate-700"
                >
                    <ArrowLeft className="size-4 mr-1" />
                    Back to Projects
                </Button>
                <span className="text-slate-500">/</span>
                <span className="text-slate-300">{projectName}</span>
                <span className="text-slate-500">/</span>

                {/* Section Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-white font-medium hover:bg-slate-700 px-3 py-2 h-auto"
                        >
                            {isSecretsPage ? (
                                <Shield className="w-4 h-4 mr-2" />
                            ) : (
                                <Settings className="w-4 h-4 mr-2" />
                            )}
                            {currentSection}
                            <ChevronDown className="w-4 h-4 ml-2" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="bg-slate-800 border-slate-700 min-w-[200px]"
                        align="start"
                    >
                        <DropdownMenuItem
                            onClick={() => handleSectionChange('environments')}
                            className={`text-white hover:bg-slate-700 cursor-pointer p-3 ${!isSecretsPage ? 'bg-slate-700' : ''
                                }`}
                        >
                            <Settings className="w-4 h-4 mr-3 text-emerald-400" />
                            <div className="flex flex-col">
                                <span className="font-medium">Environments</span>
                                <span className="text-xs text-slate-400">
                                    View point in time
                                </span>
                            </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => handleSectionChange('secrets')}
                            className={`text-white hover:bg-slate-700 cursor-pointer p-3 ${isSecretsPage ? 'bg-slate-700' : ''
                                }`}
                        >
                            <Shield className="w-4 h-4 mr-3 text-red-400" />
                            <div className="flex flex-col">
                                <span className="font-medium">Secrets</span>
                                <span className="text-xs text-slate-400">
                                    View point in time
                                </span>
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                        <div>
                            <h1 className="text-3xl font-bold text-white">{projectName}</h1>
                            <p className="text-slate-400">
                                {isSecretsPage
                                    ? "View point in time for secrets"
                                    : "View point in time for environments"
                                }
                            </p>
                        </div>
                    </div>

                    {/* Environment Type Selector */}
                    <div className="mt-4">
                        <div className="flex items-center space-x-3">
                            <span className="text-slate-300 text-sm font-medium">Environment:</span>
                            <Select value={selectedEnvironment} onValueChange={handleEnvironmentChange}>
                                <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                                    <SelectValue>
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-3 h-3 rounded-full ${getEnvironmentColor(selectedEnvData?.color || 'slate')}`} />
                                            <span>{selectedEnvData?.name}</span>
                                            {selectedEnvData?.is_protected && (
                                                <Shield className="w-3 h-3 text-red-400" />
                                            )}
                                        </div>
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    {environmentTypes.map((env) => (
                                        <SelectItem key={env.id} value={env.id} className="text-white hover:bg-slate-700">
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-3 h-3 rounded-full ${getEnvironmentColor(env.color)}`} />
                                                <span>{env.name}</span>
                                                {env.is_protected && (
                                                    <Shield className="w-3 h-3 text-red-400" />
                                                )}
                                                {env.is_default && (
                                                    <Badge className="bg-blue-600 text-blue-100 text-xs">Default</Badge>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3">
                    {/* Options Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-slate-400 border-slate-600 hover:bg-slate-700"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="bg-slate-800 border-slate-700 min-w-[160px]"
                            align="end"
                        >
                            <DropdownMenuItem
                                onClick={onRefresh}
                                disabled={isRefetching}
                                className="text-white hover:bg-slate-700 cursor-pointer"
                            >
                                <RefreshCw
                                    className={`w-4 h-4 mr-2 ${isRefetching ? "animate-spin" : ""}`}
                                />
                                Refresh
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={onExport}
                                className="text-white hover:bg-slate-700 cursor-pointer"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </DropdownMenuItem>
                            {canEdit && (
                                <DropdownMenuItem
                                    onClick={onManageEnvironments}
                                    className="text-white hover:bg-slate-700 cursor-pointer"
                                >
                                    <Settings className="w-4 h-4 mr-2" />
                                    Manage Environments
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {canEdit && (
                        <>
                            <Button
                                onClick={onBulkImport}
                                variant="outline"
                                className="text-white border-slate-600 hover:bg-slate-700"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Bulk Import
                            </Button>

                            <Button
                                onClick={onAddVariable}
                                className={`text-white ${isSecretsPage
                                    ? "bg-red-500 hover:bg-red-600"
                                    : "bg-emerald-500 hover:bg-emerald-600"
                                    }`}
                            >
                                {isSecretsPage ? (
                                    <>
                                        <Shield className="w-4 h-4 mr-2" />
                                        Add Secret
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Variable
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
