import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Download, Eye, Save, Type, Layout, Settings, GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { Stage, Layer, Text as KonvaText, Rect } from 'react-konva';
import { DraggableGroup } from '../components/canvas/DraggableGroup';
import { AIChatbot } from '../components/canvas/AIChatbot';
import { LayoutBlock } from '../types/layout';
import api from '../utils/api';
import { Loader2, ZoomIn, ZoomOut, Maximize, Sparkles, MessageSquare } from 'lucide-react';

// A4 Aspect Ratio Base Dimensions
const A4_WIDTH = 794; // approx 21cm at 96dpi
const A4_HEIGHT = 1123; // approx 29.7cm at 96dpi

export default function Builder() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [blocks, setBlocks] = useState<LayoutBlock[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'ai'>('content');

  // Ref for the container to calculate scaling
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageScale, setStageScale] = useState(1);
  const [baseScale, setBaseScale] = useState(1);
  const [stageDimensions, setStageDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const loadResume = async () => {
      try {
        setIsLoading(true);

        // If coming from TemplateEditor with a converted layout, use it immediately
        if (location.state?.initialBlocks && location.state.initialBlocks.length > 0) {
          setBlocks(location.state.initialBlocks);
          // Save to the backend so it can be persisted/saved later
          const newResumeResponse = await api.post('/resume', {
            title: `${location.state.sourceTemplateId || 'Template'} Custom`,
            layout: location.state.initialBlocks
          });
          setResumeId(newResumeResponse.data._id);
          return;
        }

        // Otherwise fetch from API
        const { data } = await api.get('/resume');

        if (data && data.length > 0) {
          // Load the most recent one for now
          setBlocks(data[0].layout || []);
          setResumeId(data[0]._id);
        } else {
          // If no resume exists, create a new one with defaults
          const defaultBlocks: LayoutBlock[] = [
            {
              id: 'name-header',
              type: 'header',
              x: 50,
              y: 60,
              width: 600,
              height: 60,
              content: user?.name || 'Your Name',
              fontSize: 36,
              fontWeight: 'bold',
              fill: '#0f172a'
            },
            {
              id: 'contact-info',
              type: 'text',
              x: 50,
              y: 110,
              width: 600,
              height: 30,
              content: `${user?.email} • (555) 123-4567 • New York, NY`,
              fontSize: 14,
              fill: '#475569'
            },
            {
              id: 'divider-1',
              type: 'header',
              x: 50,
              y: 140,
              width: A4_WIDTH - 100,
              height: 2,
              content: '',
              fill: '#cbd5e1'
            }
          ];

          const newResumeResponse = await api.post('/resume', {
            title: 'My Standard Resume',
            layout: defaultBlocks
          });

          setBlocks(defaultBlocks);
          setResumeId(newResumeResponse.data._id);
        }
      } catch (err) {
        console.error("Failed to load resume", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadResume();
    }
  }, [user]);

  // Handle resizing the Konva stage to fit the flex container
  useEffect(() => {
    const fitStageIntoParentContainer = () => {
      if (!containerRef.current) return;

      const containerW = containerRef.current.offsetWidth;
      const containerH = containerRef.current.offsetHeight;

      // Calculate scale to fit both width and height while maintaining A4 ratio
      const padding = isPreviewMode ? 40 : 80;
      const scaleW = (containerW - padding) / A4_WIDTH;
      const scaleH = (containerH - padding) / A4_HEIGHT;
      const scale = Math.min(scaleW, scaleH);

      setStageScale(scale);
      setBaseScale(scale);
      setStageDimensions({ width: containerW, height: containerH });
      setStagePos({
        x: (containerW - A4_WIDTH * scale) / 2,
        y: (containerH - A4_HEIGHT * scale) / 2
      });
    };

    fitStageIntoParentContainer();
    window.addEventListener('resize', fitStageIntoParentContainer);
    // Also re-run when preview mode toggles
    return () => window.removeEventListener('resize', fitStageIntoParentContainer);
  }, [isPreviewMode]);

  const checkDeselect = (e: any) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  // State to hold the pan/zoom position of the inner canvas wrapper
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  const isZoomed = Math.abs(stageScale - baseScale) > 0.01;

  const handleWheel = (e: any) => {
    e.evt.preventDefault();

    const stage = e.target.getStage();
    if (!stage) return;

    const oldScale = stage.scaleX();
    // Scaling factor multiplier
    const scaleBy = 1.1;

    // Detect if zooming in or out
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    // calculate new scale: holding Ctrl flips the direction, or trackpad might send different delta
    const direction = e.evt.deltaY > 0 ? -1 : 1;

    // Limits
    let newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    if (newScale < 0.2) newScale = 0.2;
    if (newScale > 5) newScale = 5;

    setStageScale(newScale);

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    setStagePos(newPos);

    if (Math.abs(newScale - baseScale) > 0.01) {
      setSelectedId(null);
    }
  };

  const handleZoomButton = (direction: 1 | -1) => {
    const scaleBy = 1.2;
    let newScale = direction > 0 ? stageScale * scaleBy : stageScale / scaleBy;
    if (newScale < 0.2) newScale = 0.2;
    if (newScale > 5) newScale = 5;

    if (!containerRef.current) return;
    const centerX = containerRef.current.offsetWidth / 2;
    const centerY = containerRef.current.offsetHeight / 2;

    const mousePointTo = {
      x: (centerX - stagePos.x) / stageScale,
      y: (centerY - stagePos.y) / stageScale,
    };

    setStageScale(newScale);
    setStagePos({
      x: centerX - mousePointTo.x * newScale,
      y: centerY - mousePointTo.y * newScale,
    });

    if (Math.abs(newScale - baseScale) > 0.01) {
      setSelectedId(null);
    }
  };

  const updateBlock = (id: string, newAttrs: any) => {
    setBlocks(blocks.map(block => {
      if (block.id === id) {
        return { ...block, ...newAttrs };
      }
      return block;
    }));
  };

  const addBlock = (type: 'text' | 'header') => {
    const newBlock: LayoutBlock = {
      id: `block-${Date.now()}`,
      type,
      x: 50,
      y: 200,
      width: 400,
      height: 50,
      content: type === 'header' ? 'New Heading' : 'New text block for experience or summary. Double click to edit in sidebar.',
      fontSize: type === 'header' ? 24 : 14,
      fontWeight: type === 'header' ? 'bold' : 'normal',
      fill: type === 'header' ? '#1e293b' : '#334155'
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  const handleEnhanceContent = async () => {
    if (!selectedId) return;
    const block = blocks.find(b => b.id === selectedId);
    if (!block || !block.content) return;

    setIsGenerating(true);
    try {
      const type = block.type === 'header' ? 'summary' : 'bullets';
      const { data } = await api.post('/ai/generate', {
        type,
        context: block.content
      });
      if (data.result) {
        updateBlock(selectedId, { content: data.result.trim() });
      }
    } catch (err) {
      console.error("AI Enhancement failed", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Top Navigation Bar */}
      <header className="h-16 flex-none bg-white border-b border-slate-200 shadow-sm z-20 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors group"
          >
            <div className="p-1.5 rounded-md bg-slate-100 group-hover:bg-indigo-50 mr-2 transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium hidden sm:block">Dashboard</span>
          </button>
          <div className="h-6 border-l border-slate-200 hidden sm:block"></div>
          <span className="text-sm text-slate-500 hidden sm:block">Editing: <strong className="text-slate-900">Untitled Resume</strong></span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Mode Toggle */}
          <div className="hidden md:flex items-center space-x-4 border-r border-slate-200 pr-4 mr-2">
            <span className="text-sm font-medium text-slate-500 hidden lg:block">Editor Mode</span>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 relative">
              {/* Active background slider effect (Right Side active) */}
              <div className="absolute right-1 inset-y-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm"></div>

              <button
                onClick={() => {
                  if (location.state?.sourceTemplateId) {
                    navigate(`/template-editor/${location.state.sourceTemplateId}`);
                  } else {
                    navigate('/templates');
                  }
                }}
                className="relative z-10 px-5 py-1.5 text-slate-500 hover:text-slate-800 rounded-lg text-sm font-medium transition-colors w-28 text-center"
              >
                Template
              </button>
              <button className="relative z-10 px-5 py-1.5 text-indigo-700 rounded-lg text-sm font-semibold pointer-events-none w-28 text-center">
                Customize
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedId(null);
              setIsPreviewMode(true);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Preview</span>
          </button>
          <button
            onClick={async () => {
              if (resumeId) {
                setIsSaving(true);
                try {
                  await api.put(`/resume/${resumeId}`, { layout: blocks });
                } catch (e) {
                  console.error("Failed to save", e);
                } finally {
                  setIsSaving(false);
                }
              }
            }}
            disabled={isSaving}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
          <button
            onClick={async () => {
              setIsDownloading(true);
              try {
                const response = await api.post('/pdf/custom', {
                  blocks,
                  filename: 'resume-custom.pdf',
                }, { responseType: 'blob' });
                const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                const link = document.createElement('a');
                link.href = url;
                link.download = 'resume-custom.pdf';
                link.click();
                URL.revokeObjectURL(url);
              } catch (err) {
                console.error('Failed to download PDF', err);
              } finally {
                setIsDownloading(false);
              }
            }}
            disabled={isDownloading}
            className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            <span>{isDownloading ? 'Generating...' : 'Download PDF'}</span>
          </button>
        </div>
      </header>

      {/* Main Split Interface */}
      <div className="flex-1 flex overflow-hidden">
        {!isPreviewMode && (
          // Left Side: Editor Tool Panel & Properties combined into flex-1
          <div className="flex-1 flex overflow-hidden z-10 border-r border-slate-200 bg-white">
            {/* Tool Icons */}
            <div className="w-16 sm:w-20 border-r border-slate-200 bg-slate-50 flex-none flex flex-col items-center py-4 space-y-4">
              {[
                { id: 'content', icon: Type, label: 'Content' },
                { id: 'ai', icon: MessageSquare, label: 'AI Assistant' },
                { id: 'layout', icon: Layout, label: 'Layout' },
                { id: 'settings', icon: Settings, label: 'Settings' }
              ].map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => ['content', 'ai'].includes(tool.id) && setActiveTab(tool.id as any)}
                  className={`p-3 rounded-xl flex flex-col items-center justify-center space-y-1 transition-all group relative ${activeTab === tool.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                  title={tool.label}
                >
                  <tool.icon className="h-6 w-6" />
                  <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 absolute -bottom-5 transition-opacity whitespace-nowrap">
                    {tool.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 bg-white overflow-y-auto custom-scrollbar flex flex-col">
              {activeTab === 'ai' ? (
                <div className="flex-1 p-4 flex flex-col overflow-hidden">
                   <AIChatbot />
                </div>
              ) : (
                <div className="p-6">
                  {/* ... Properties Side content ... */}
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Add Elements</h2>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  <button 
                    draggable 
                    onDragStart={(e) => { e.dataTransfer.setData('type', 'header'); }}
                    onClick={() => addBlock('header')} 
                    className="flex items-center p-3 border border-slate-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-slate-700 font-medium text-sm group cursor-grab active:cursor-grabbing"
                  >
                    <GripVertical className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 mr-2" />
                    Heading
                  </button>
                  <button 
                    draggable 
                    onDragStart={(e) => { e.dataTransfer.setData('type', 'text'); }}
                    onClick={() => addBlock('text')} 
                    className="flex items-center p-3 border border-slate-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-slate-700 font-medium text-sm group cursor-grab active:cursor-grabbing"
                  >
                    <GripVertical className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 mr-2" />
                    Text Block
                  </button>
                </div>

                <hr className="border-slate-100 my-6" />

                <h2 className="text-xl font-bold text-slate-900 mb-1">Properties</h2>
                {selectedId ? (
                  <div className="space-y-4 mt-4">
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mb-4">
                      <p className="text-sm font-medium text-indigo-800">Editing Layer: {blocks.find(b => b.id === selectedId)?.type}</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Content</label>
                        <button
                          onClick={handleEnhanceContent}
                          disabled={isGenerating}
                          className="flex items-center space-x-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors disabled:opacity-50"
                        >
                          {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                          <span>Enhance with AI</span>
                        </button>
                      </div>
                      <textarea
                        rows={6}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-slate-50 focus:bg-white transition-colors"
                        value={blocks.find(b => b.id === selectedId)?.content || ''}
                        onChange={(e) => updateBlock(selectedId, { content: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Font Size (px)</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-slate-50 focus:bg-white transition-colors"
                          value={blocks.find(b => b.id === selectedId)?.fontSize || 14}
                          onChange={(e) => updateBlock(selectedId, { fontSize: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Color</label>
                        <input
                          type="color"
                          className="w-full h-10 px-1 py-1 border border-slate-300 rounded-lg cursor-pointer"
                          value={blocks.find(b => b.id === selectedId)?.fill || '#000000'}
                          onChange={(e) => updateBlock(selectedId, { fill: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={() => {
                          setBlocks(blocks.filter(b => b.id !== selectedId));
                          setSelectedId(null);
                        }}
                        className="w-full py-2 px-4 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm"
                      >
                        Delete Block
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 mt-4">
                    <p className="text-sm text-slate-400 text-center px-4">Select an element on the canvas to edit its properties.</p>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        )}

        {/* Right Side: Konva Canvas */}
        {isPreviewMode ? (
          /* --- PREVIEW MODE: Scrollable fixed-size render (like TemplateEditor) --- */
          <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col">
            {/* Preview top bar */}
            <div className="flex-none h-14 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-6">
              <span className="text-sm font-semibold text-slate-700">Resume Preview</span>
              <button
                onClick={() => setIsPreviewMode(false)}
                className="bg-red-500 hover:bg-red-600 transition-colors text-white px-4 py-2 rounded-lg text-sm font-semibold"
              >
                Close Preview
              </button>
            </div>
            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto overflow-x-auto p-8 flex justify-center">
              <motion.div
                initial={{ scale: 0.97, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex-none shadow-2xl origin-top"
                style={{ width: `${A4_WIDTH}px`, height: `${A4_HEIGHT}px`, transform: 'scale(0.85)', transformOrigin: 'top center', marginBottom: `-${A4_HEIGHT * 0.15}px` }}
              >
                <Stage
                  width={A4_WIDTH}
                  height={A4_HEIGHT}
                  scaleX={1}
                  scaleY={1}
                >
                  <Layer>
                    <Rect x={0} y={0} width={A4_WIDTH} height={A4_HEIGHT} fill="white"
                      shadowColor="rgba(0,0,0,0.15)" shadowBlur={20} shadowOffset={{ x: 0, y: 10 }}
                    />
                    {blocks.map((block) => (
                      <DraggableGroup
                        key={block.id}
                        id={block.id}
                        x={block.x}
                        y={block.y}
                        width={block.width}
                        height={block.height}
                        isSelected={false}
                        isZoomed={true}
                        onSelect={() => { }}
                        onChange={() => { }}
                      >
                        {block.height === 2 && block.type === 'header' ? (
                          <Rect width={block.width} height={block.height} fill={block.fill || '#000'} />
                        ) : (
                          <KonvaText
                            text={block.content}
                            width={block.width}
                            fontSize={block.fontSize}
                            fontFamily={block.fontFamily || 'Inter, Arial, sans-serif'}
                            fontStyle={block.fontWeight as string}
                            fill={block.fill}
                            align={block.align || 'left'}
                            wrap="word"
                          />
                        )}
                      </DraggableGroup>
                    ))}
                  </Layer>
                </Stage>
              </motion.div>
            </div>
          </div>
        ) : (
          /* --- EDIT MODE: Full-bleed Konva Stage with pan/zoom --- */
          <div
            ref={containerRef}
            className="flex-[1.5] bg-slate-200/50 flex justify-center items-center overflow-hidden relative"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const type = e.dataTransfer.getData('type') as 'header' | 'text';
              if (!type) return;

              // Use the stage reference from motion.div if needed, or just get it via Konva global if needed.
              // Better: find the stage by checking the target or using a ref.
              // For simplicity, we can use the container ref to find the drop point relative to stage.
              const stage = (containerRef.current?.querySelector('.konvajs-content') as any)?.__konva_stage;
              if (stage) {
                stage.setPointersPositions(e);
                const pos = stage.getPointerPosition();
                
                // Convert screen pos to stage pos (considering zoom & pan)
                const transformedPos = {
                  x: (pos.x - stage.x()) / stage.scaleX(),
                  y: (pos.y - stage.y()) / stage.scaleY()
                };

                const newBlock: LayoutBlock = {
                  id: `dropped-${Date.now()}`,
                  type,
                  x: transformedPos.x,
                  y: transformedPos.y,
                  width: type === 'header' ? 300 : 200,
                  height: type === 'header' ? 40 : 100,
                  content: type === 'header' ? 'New Heading' : 'New text block content...',
                  fontSize: type === 'header' ? 24 : 14,
                  fontWeight: type === 'header' ? 'bold' : 'normal',
                  fill: '#000000',
                };
                setBlocks([...blocks, newBlock]);
                setSelectedId(newBlock.id);
              }
            }}
          >
            {/* Controls Overlay */}
            <div className="absolute top-4 right-4 z-10 flex space-x-2">
              {!isZoomed && (
                <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 text-xs font-medium text-slate-600 flex items-center">
                  Drag elements to format
                </div>
              )}
              {isZoomed && (
                <button
                  onClick={() => {
                    setStageScale(baseScale);
                    if (containerRef.current) {
                      setStagePos({
                        x: (containerRef.current.offsetWidth - A4_WIDTH * baseScale) / 2,
                        y: (containerRef.current.offsetHeight - A4_HEIGHT * baseScale) / 2
                      });
                    }
                  }}
                  className="bg-indigo-100 hover:bg-indigo-200 hover:text-indigo-800 transition-colors px-3 py-1.5 rounded-lg shadow-sm border border-indigo-200 text-xs font-semibold text-indigo-700 cursor-pointer flex items-center"
                >
                  <Maximize className="w-3.5 h-3.5 mr-1.5" />
                  Reset Zoom to Edit
                </button>
              )}
              <div className="bg-white/90 backdrop-blur-md px-2 py-1.5 rounded-lg shadow-sm border border-slate-200 text-xs font-medium text-slate-600 flex items-center space-x-2">
                <button
                  onClick={() => handleZoomButton(-1)}
                  className="hover:bg-slate-100 p-1 rounded transition-colors text-slate-500 hover:text-slate-900"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center">{Math.round(stageScale * 100)}%</span>
                <button
                  onClick={() => handleZoomButton(1)}
                  className="hover:bg-slate-100 p-1 rounded transition-colors text-slate-500 hover:text-slate-900"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-200/50 z-20">
                <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg">
                  <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-4" />
                  <p className="text-slate-600 font-medium">Loading layout...</p>
                </div>
              </div>
            ) : null}

            {/* Konva Stage Wrapper */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full"
              style={{ cursor: isZoomed ? 'grab' : 'default' }}
            >
              <Stage
                width={stageDimensions.width}
                height={stageDimensions.height}
                scaleX={stageScale}
                scaleY={stageScale}
                x={stagePos.x}
                y={stagePos.y}
                onMouseDown={checkDeselect}
                onTouchStart={checkDeselect}
                onWheel={handleWheel}
                draggable={isZoomed || isPreviewMode}
                onDragMove={(e) => {
                  // If dragging the whole stage, update stagePos
                  if (e.target === e.target.getStage()) {
                    setStagePos({ x: e.target.x(), y: e.target.y() });
                  }
                }}
              >
                <Layer>
                  {/* Background White Canvas */}
                  <Rect
                    x={0}
                    y={0}
                    width={A4_WIDTH}
                    height={A4_HEIGHT}
                    fill="white"
                    shadowColor="rgba(0,0,0,0.15)"
                    shadowBlur={20}
                    shadowOffset={{ x: 0, y: 10 }}
                  />

                  {blocks.map((block) => (
                    <DraggableGroup
                      key={block.id}
                      id={block.id}
                      x={block.x}
                      y={block.y}
                      width={block.width}
                      height={block.height}
                      isSelected={block.id === selectedId}
                      isZoomed={isZoomed || isPreviewMode}
                      onSelect={() => {
                        if (isZoomed || isPreviewMode) return;
                        setSelectedId(block.id);
                      }}
                      onChange={(newAttrs) => updateBlock(block.id, newAttrs)}
                    >
                      {block.height === 2 && block.type === 'header' ? (
                        // Special case for divider lines
                        <Rect
                          width={block.width}
                          height={block.height}
                          fill={block.fill || '#000'}
                        />
                      ) : (
                        <KonvaText
                          text={block.content}
                          width={block.width}
                          fontSize={block.fontSize}
                          fontFamily={block.fontFamily || "Inter, Arial, sans-serif"}
                          fontStyle={block.fontWeight as string}
                          fill={block.fill}
                          align={block.align || 'left'}
                          wrap="word"
                        />
                      )}
                    </DraggableGroup>
                  ))}
                </Layer>
              </Stage>
            </motion.div>
          </div>
        )} {/* end edit mode */}
      </div>
    </div>
  );
}
