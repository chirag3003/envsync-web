import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PointInTimeData } from "@/pages/PointInTime";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
    History, 
    Plus, 
    Edit, 
    Minus, 
    User, 
    Calendar, 
    MessageSquare, 
    GitBranch,
    Clock,
    Key
} from "lucide-react";

interface ViewPitChangesModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    pitData: PointInTimeData;
}

interface ChangeDetail {
    key: string;
    operation: 'CREATE' | 'UPDATE' | 'DELETE';
    old_value?: string;
    new_value?: string;
    description?: string;
}

export const ViewPitChangesModal = ({ isOpen, onOpenChange, pitData }: ViewPitChangesModalProps) => {
    // TODO: mock data - remove this once we have the real data
    const changes: ChangeDetail[] = [
        { 
            key: "DATABASE_URL", 
            operation: "UPDATE",
            old_value: "postgresql://old-host:5432/myapp",
            new_value: "postgresql://new-host:5432/myapp",
            description: "Updated database connection string for new server"
        },
        { 
            key: "API_SECRET", 
            operation: "DELETE",
            old_value: "sk-old-secret-key-12345",
            description: "Removed deprecated API secret key"
        },
        { 
            key: "REDIS_HOST", 
            operation: "CREATE",
            new_value: "redis://cache-server:6379",
            description: "Added Redis cache server configuration"
        },
        {
            key: "JWT_EXPIRY",
            operation: "UPDATE",
            old_value: "3600",
            new_value: "7200",
            description: "Extended JWT token expiry time"
        },
        {
            key: "FEATURE_FLAG_NEW_UI",
            operation: "CREATE",
            new_value: "true",
            description: "Enabled new UI feature flag"
        }
    ];

    const getOperationIcon = (operation: string) => {
        switch (operation) {
            case 'CREATE':
                return <Plus className="w-4 h-4 text-green-400" />;
            case 'UPDATE':
                return <Edit className="w-4 h-4 text-blue-400" />;
            case 'DELETE':
                return <Minus className="w-4 h-4 text-red-400" />;
            default:
                return <Clock className="w-4 h-4 text-slate-400" />;
        }
    };

    const getOperationColor = (operation: string) => {
        switch (operation) {
            case 'CREATE':
                return 'bg-green-500/20 text-green-300 border-green-500/30';
            case 'UPDATE':
                return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
            case 'DELETE':
                return 'bg-red-500/20 text-red-300 border-red-500/30';
            default:
                return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }),
            time: date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit',
                hour12: true 
            })
        };
    };

    const dateTime = formatDate(pitData.created_at);

    const changeStats = {
        created: changes.filter(c => c.operation === 'CREATE').length,
        updated: changes.filter(c => c.operation === 'UPDATE').length,
        deleted: changes.filter(c => c.operation === 'DELETE').length
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="pb-4">
                    <DialogTitle className="text-white text-2xl flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <History className="w-6 h-6 text-purple-400" />
                        </div>
                        Point-in-Time Changes
                    </DialogTitle>
                    <DialogDescription className="text-slate-300 text-base">
                        Detailed view of all changes made in this snapshot
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 flex-1 overflow-hidden flex flex-col">
                    {/* PIT Information Header */}
                    <Card className="bg-slate-700/30 border-slate-600">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                        <GitBranch className="w-4 h-4" />
                                        PIT ID
                                    </div>
                                    <code className="text-white font-mono text-sm bg-slate-700/50 px-3 py-2 rounded-md block">
                                        {pitData.pit_id}
                                    </code>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                        <Calendar className="w-4 h-4" />
                                        Created On
                                    </div>
                                    <div className="text-white">
                                        <p className="font-medium">{dateTime.date}</p>
                                        <p className="text-slate-400 text-sm">{dateTime.time}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                        <User className="w-4 h-4" />
                                        Created By
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                            {pitData.user_id.charAt(0).toUpperCase()}
                                        </div>
                                        <p className="text-white font-medium text-sm">{pitData.user_id}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                        <Key className="w-4 h-4" />
                                        Total Changes
                                    </div>
                                    <p className="text-white font-bold text-lg">{changes.length}</p>
                                </div>
                            </div>
                            
                            <Separator className="bg-slate-600 my-4" />
                            
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                    <MessageSquare className="w-4 h-4" />
                                    Commit Message
                                </div>
                                <p className="text-slate-300 leading-relaxed bg-slate-700/30 p-3 rounded-lg">
                                    {pitData.change_request_message}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Change Statistics */}
                    <Card className="bg-slate-700/30 border-slate-600">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg text-white">Change Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                                    <div className="text-2xl font-bold text-green-400">{changeStats.created}</div>
                                    <div className="text-sm text-green-300 flex items-center justify-center gap-1 mt-1">
                                        <Plus className="w-3 h-3" />
                                        Created
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                    <div className="text-2xl font-bold text-blue-400">{changeStats.updated}</div>
                                    <div className="text-sm text-blue-300 flex items-center justify-center gap-1 mt-1">
                                        <Edit className="w-3 h-3" />
                                        Updated
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                                    <div className="text-2xl font-bold text-red-400">{changeStats.deleted}</div>
                                    <div className="text-sm text-red-300 flex items-center justify-center gap-1 mt-1">
                                        <Minus className="w-3 h-3" />
                                        Deleted
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Detailed Changes List */}
                    <Card className="flex-1 overflow-hidden border-slate-600">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg text-white">Detailed Changes</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-hidden">
                            <div className="overflow-auto max-h-96 space-y-0">
                                {changes.map((change, index) => (
                                    <div
                                        key={index}
                                        className="border-b border-slate-700 last:border-b-0 p-6 hover:bg-slate-750/30 transition-colors"
                                    >
                                        <div className="space-y-4">
                                            {/* Change Header */}
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Badge className={`${getOperationColor(change.operation)} border font-medium px-3 py-1`}>
                                                        {getOperationIcon(change.operation)}
                                                        <span className="ml-1">{change.operation}</span>
                                                    </Badge>
                                                    <code className="text-white font-mono text-sm bg-slate-700/50 px-3 py-1 rounded">
                                                        {change.key}
                                                    </code>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            {change.description && (
                                                <p className="text-slate-300 text-sm leading-relaxed">
                                                    {change.description}
                                                </p>
                                            )}

                                            {/* Value Changes */}
                                            <div className="space-y-3">
                                                {change.operation === 'UPDATE' && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                                                                <Minus className="w-3 h-3 text-red-400" />
                                                                BEFORE
                                                            </div>
                                                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                                                <code className="text-red-200 text-sm break-all">
                                                                    {change.old_value || 'N/A'}
                                                                </code>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                                                                <Plus className="w-3 h-3 text-green-400" />
                                                                AFTER
                                                            </div>
                                                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                                                                <code className="text-green-200 text-sm break-all">
                                                                    {change.new_value || 'N/A'}
                                                                </code>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {change.operation === 'CREATE' && change.new_value && (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                                                            <Plus className="w-3 h-3 text-green-400" />
                                                            NEW VALUE
                                                        </div>
                                                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                                                            <code className="text-green-200 text-sm break-all">
                                                                {change.new_value}
                                                            </code>
                                                        </div>
                                                    </div>
                                                )}

                                                {change.operation === 'DELETE' && change.old_value && (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                                                            <Minus className="w-3 h-3 text-red-400" />
                                                            REMOVED VALUE
                                                        </div>
                                                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                                            <code className="text-red-200 text-sm break-all">
                                                                {change.old_value}
                                                            </code>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {changes.length === 0 && (
                                    <div className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <History className="w-16 h-16 text-slate-500" />
                                            <div>
                                                <p className="text-slate-400 text-lg font-medium">No Changes Found</p>
                                                <p className="text-slate-500 text-sm">This point-in-time snapshot contains no variable changes</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
};
