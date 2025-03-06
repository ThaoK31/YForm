import { UseFormReturn, useFieldArray } from "react-hook-form"
import { FormValues } from "./survey-form"
import { QuestionCard } from "@/components/surveys/create/question-card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  Active,
  UniqueIdentifier
} from "@dnd-kit/core"
import { 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable,
  arrayMove
} from "@dnd-kit/sortable"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { CSS } from '@dnd-kit/utilities'
import { useState, useEffect, useRef } from "react"

// Stockage des dimensions des éléments
const itemDimensions = new Map<UniqueIdentifier, {width: number, height: number}>();

// Composant pour rendre un élément glissable-déposable
function SortableItem({ id, children }: { id: string, children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const nodeRef = useRef<HTMLDivElement | null>(null);
  
  // Mesurer et stocker les dimensions
  useEffect(() => {
    const node = nodeRef.current;
    if (node) {
      const { width, height } = node.getBoundingClientRect();
      itemDimensions.set(id, { width, height });
    }
    
    // Nettoyer à la destruction
    return () => {
      itemDimensions.delete(id);
    };
  }, [id, children]);
  
  // Intégrer la référence pour les mesures et pour le sortable
  const setRefs = (node: HTMLDivElement) => {
    nodeRef.current = node;
    setNodeRef(node);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: isDragging ? 'relative' as const : undefined,
    zIndex: isDragging ? 0 : 1,
    // Si on est en train de déplacer, on préserve la hauteur pour éviter la déformation
    height: isDragging ? itemDimensions.get(id)?.height : undefined,
    // Empêcher l'écrasement en largeur
    width: isDragging ? 'auto' : '100%',
  };

  return (
    <div 
      ref={setRefs} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`mb-4 ${isDragging ? 'drop-shadow-none' : ''}`}
    >
      {children}
    </div>
  );
}

interface QuestionListProps {
  form: UseFormReturn<FormValues>
}

export function QuestionList({ form }: QuestionListProps) {
  const { fields, append, remove, move } = useFieldArray({
    name: "questions",
    control: form.control,
  })
  
  // État pour suivre l'élément actif lors du glisser-déposer
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  // Maintenir les positions pour utiliser avec les overlays
  const [items, setItems] = useState<UniqueIdentifier[]>([]);
  
  // Synchroniser les items avec les fields
  useEffect(() => {
    setItems(fields.map(field => field.id));
  }, [fields]);

  // Configuration des capteurs pour le drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )
  
  // Gestion du début du glisser-déposer
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    const index = fields.findIndex(field => field.id === active.id);
    setActiveIndex(index);
  };

  // Gestion de la fin du glisser-déposer
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    setActiveId(null);
    setActiveIndex(null);
    
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex(field => field.id === active.id)
      const newIndex = fields.findIndex(field => field.id === over.id)
      
      // Mettre à jour l'ordre dans le formulaire
      move(oldIndex, newIndex)
      
      // Mettre à jour directement l'ordre dans le formulaire
      const values = form.getValues("questions");
      values.forEach((field, index) => {
        form.setValue(`questions.${index}.order`, index + 1);
      })
      
      // Mettre à jour notre liste interne
      setItems(arrayMove(items, oldIndex, newIndex));
    }
  }

  const handleAdd = () => {
    append({ text: "", type: "open", options: [], order: fields.length + 1 })
  }

  const handleDuplicateQuestion = (index: number) => {
    const question = form.getValues(`questions.${index}`);
    append({ ...question, order: fields.length + 1 });
  }

  return (
    <div className="space-y-4 my-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext 
          items={items}
          strategy={verticalListSortingStrategy}
        >
          {fields.map((field, index) => (
            <SortableItem key={field.id} id={field.id}>
              <div 
                className="h-full"
                // Empêcher le drag quand on clique sur des champs de texte
                onPointerDown={(e) => {
                  const target = e.target as HTMLElement;
                  // Si on clique sur un input ou textarea, empêcher le déclenchement du drag
                  if (
                    target.tagName === 'INPUT' || 
                    target.tagName === 'TEXTAREA' || 
                    target.isContentEditable ||
                    target.closest('input') || 
                    target.closest('textarea')
                  ) {
                    // Empêcher la propagation de l'événement pour éviter de déclencher le drag
                    e.stopPropagation();
                  }
                }}
              >
                <QuestionCard
                  form={form}
                  index={index}
                  onRemove={() => remove(index)}
                  onDuplicate={() => handleDuplicateQuestion(index)}
                />
              </div>
            </SortableItem>
          ))}
        </SortableContext>
        
        {/* Overlay pour afficher l'élément pendant le déplacement */}
        <DragOverlay
          adjustScale={false} 
          dropAnimation={{
            duration: 150,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          }}
          zIndex={1000}
        >
          {activeId && activeIndex !== null && (
            <div className="transform-none shadow-lg rounded-md" style={{
              width: activeId ? itemDimensions.get(activeId)?.width : undefined,
              maxWidth: '100%',
            }}>
              <QuestionCard
                form={form}
                index={activeIndex}
                onRemove={() => {}}
                onDuplicate={() => {}}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
      
      <Button
        type="button"
        onClick={handleAdd}
        variant="outline"
        className="w-full"
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Ajouter une question
      </Button>
    </div>
  )
} 