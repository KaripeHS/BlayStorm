import { StoryMap } from '../components/engagement/StoryMap';
import { useStory } from '../hooks/useEngagement';

const StoryPage = () => {
  const { worlds, loading, startChapter } = useStory();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-black flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Loading Story Map...</div>
      </div>
    );
  }

  const handleSelectChapter = async (chapterId: string) => {
    try {
      await startChapter(chapterId);
      // TODO: Navigate to game with chapter problems
      console.log('Starting chapter:', chapterId);
    } catch (error) {
      console.error('Failed to start chapter:', error);
    }
  };

  return (
    <StoryMap
      worlds={worlds}
      onSelectChapter={handleSelectChapter}
    />
  );
};

export default StoryPage;
