import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/Table';
import { getProblems, deleteProblem } from '../../services/problems.service';
import { type Problem, ProblemStatus, ProblemPriority } from '../../types';

const ProblemList = () => {
    const [problems, setProblems] = useState<Problem[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        loadProblems();
    }, []);

    const loadProblems = async () => {
        try {
            const data = await getProblems();
            setProblems(data);
        } catch (error) {
            console.error('Error loading problems:', error);
        }
    };

    const handleDelete = async (problem: Problem) => {
        if (window.confirm('Are you sure you want to delete this problem?')) {
            try {
                await deleteProblem(problem.id);
                loadProblems();
            } catch (error) {
                console.error('Error deleting problem:', error);
            }
        }
    };

    const columns = [
        { header: 'ID', accessor: 'id' as keyof Problem },
        { header: 'Title', accessor: 'title' as keyof Problem },
        {
            header: 'Status',
            accessor: (item: Problem) => (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.status === ProblemStatus.RESOLVED ? 'bg-green-100 text-green-800' :
                    item.status === ProblemStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800' :
                        item.status === ProblemStatus.CANCELED ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                    }`}>
                    {item.status.replace('_', ' ').toUpperCase()}
                </span>
            )
        },
        {
            header: 'Priority',
            accessor: (item: Problem) => (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.priority === ProblemPriority.CRITICAL ? 'bg-red-100 text-red-800' :
                    item.priority === ProblemPriority.HIGH ? 'bg-orange-100 text-orange-800' :
                        item.priority === ProblemPriority.MEDIUM ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                    }`}>
                    {item.priority.toUpperCase()}
                </span>
            )
        },
        { header: 'Category', accessor: 'category' as keyof Problem },
        { header: 'Reporter', accessor: (item: Problem) => item.reporter?.name || 'Unknown' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Problems</h2>
                <button
                    onClick={() => navigate('/problems/new')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    New Problem
                </button>
            </div>

            <Table
                data={problems}
                columns={columns}
                onEdit={(item) => navigate(`/problems/${item.id}/edit`)}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default ProblemList;
