import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";

export const ProjectCardBlock = createReactBlockSpec(
  {
    type: "projectCard",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      title: {
        default: "Project Name",
      },
      description: {
        default: "username • Updated recently",
      },
      avatarUrl: {
        default: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
      },
      iconUrl: {
        default: "https://github.githubassets.com/favicons/favicon.png",
      },
      url: {
        default: "https://github.com",
      }
    },
    content: "none",
  },
  {
    render: (props) => {
      return (
        <div 
          className="w-full max-w-2xl border border-border-subtle rounded-md p-3 flex gap-3 bg-bg-card hover:bg-bg-card-hover transition-colors cursor-pointer select-none my-3"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const newTitle = prompt("Enter Project Title:", props.block.props.title);
            if (newTitle === null) return;
            
            const newDesc = prompt("Enter Description:", props.block.props.description);
            if (newDesc === null) return;

            props.editor.updateBlock(props.block, {
              type: "projectCard",
              props: { 
                ...props.block.props, 
                title: newTitle, 
                description: newDesc 
              }
            });
          }}
        >
          {/* Avatar Area */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-bg-app border border-border-subtle flex items-center justify-center">
              <img 
                src={props.block.props.avatarUrl} 
                alt="Avatar" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            {props.block.props.iconUrl && (
              <img 
                src={props.block.props.iconUrl} 
                alt="Icon" 
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-white border border-border-subtle"
              />
            )}
          </div>
          
          {/* Text Area */}
          <div className="flex flex-col justify-center gap-0 overflow-hidden">
            <div className="font-semibold text-text-main truncate text-[14px]">
              {props.block.props.title}
            </div>
            <div className="text-[12px] text-text-muted truncate mt-0.5">
              {props.block.props.description}
            </div>
          </div>
        </div>
      );
    },
  }
);
