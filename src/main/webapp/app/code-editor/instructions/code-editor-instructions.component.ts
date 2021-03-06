import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import Interactable from '@interactjs/core/Interactable';
import interact from 'interactjs';
import { Subscription } from 'rxjs';

import { ArtemisMarkdown } from 'app/components/util/markdown.service';
import { Participation } from '../../entities/participation';
import { WindowRef } from '../../core/websocket/window.service';
import { ProgrammingExercise } from 'app/entities/programming-exercise';
import { CodeEditorGridService, ResizeType } from 'app/code-editor/service';
import { ProgrammingExerciseInstructionComponent } from 'app/entities/programming-exercise/instructions/instructions-render';
import { ProgrammingExerciseEditableInstructionComponent } from 'app/entities/programming-exercise/instructions/instructions-editor';

@Component({
    selector: 'jhi-code-editor-instructions',
    styleUrls: ['./code-editor-instructions.scss'],
    templateUrl: './code-editor-instructions.component.html',
})
export class CodeEditorInstructionsComponent implements AfterViewInit, OnDestroy {
    @ViewChild(ProgrammingExerciseInstructionComponent, { static: false }) readOnlyInstructions: ProgrammingExerciseInstructionComponent;
    @ViewChild(ProgrammingExerciseEditableInstructionComponent, { static: false }) editableInstructions: ProgrammingExerciseEditableInstructionComponent;

    @Input() participation: Participation;
    @Input() exercise: ProgrammingExercise;
    @Input() editable = false;
    @Input() templateParticipation: Participation;
    @Output()
    onToggleCollapse = new EventEmitter<{ event: any; horizontal: boolean; interactable: Interactable; resizableMinWidth?: number; resizableMinHeight?: number }>();

    /** Resizable constants **/
    initialInstructionsWidth: number;
    minInstructionsWidth: number;
    interactResizable: Interactable;
    noInstructionsAvailable = false;

    resizeSubscription: Subscription;

    constructor(private $window: WindowRef, public artemisMarkdown: ArtemisMarkdown, private codeEditorGridService: CodeEditorGridService) {}

    /**
     * @function ngAfterViewInit
     * @desc After the view was initialized, we create an interact.js resizable object,
     *       designate the edges which can be used to resize the target element and set min and max values.
     *       The 'resizemove' callback function processes the event values and sets new width and height values for the element.
     */
    ngAfterViewInit(): void {
        this.initialInstructionsWidth = this.$window.nativeWindow.screen.width - 300 / 2;
        this.minInstructionsWidth = this.$window.nativeWindow.screen.width / 4 - 50;
        this.interactResizable = interact('.resizable-instructions');

        this.resizeSubscription = this.codeEditorGridService.subscribeForResizeEvents([ResizeType.SIDEBAR_RIGHT, ResizeType.MAIN_BOTTOM]).subscribe(() => {
            if (this.editableInstructions && this.editableInstructions.markdownEditor && this.editableInstructions.markdownEditor.aceEditorContainer) {
                this.editableInstructions.markdownEditor.aceEditorContainer.getEditor().resize();
            }
        });
    }

    ngOnDestroy(): void {
        if (this.resizeSubscription) {
            this.resizeSubscription.unsubscribe();
        }
    }

    /**
     * Update the problem statement with the new string received.
     * This does not save the new problem statement on the server.
     * @param newProblemStatement
     */
    onProblemStatementEditorUpdate(newProblemStatement: string) {
        this.exercise = { ...this.exercise, problemStatement: newProblemStatement };
    }

    /**
     * @function toggleEditorCollapse
     * @desc Calls the parent (editorComponent) toggleCollapse method
     * @param $event
     * @param {boolean} horizontal
     */
    toggleEditorCollapse($event: any) {
        this.onToggleCollapse.emit({ event: $event, horizontal: true, interactable: this.interactResizable, resizableMinWidth: this.minInstructionsWidth });
    }

    onNoInstructionsAvailable() {
        this.noInstructionsAvailable = true;
    }
}
