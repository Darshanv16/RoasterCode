import { ProblemEditor } from '@/components/admin/ProblemEditor';

export default function EditProblemPage({ params }: { params: { id: string } }) {
  return <ProblemEditor problemId={params.id} />;
}
