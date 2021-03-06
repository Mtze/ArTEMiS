import { DomainMultiOptionListCommand } from 'app/markdown-editor/domainCommands/domain-multi-option-list.command';

export class TaskHintCommand extends DomainMultiOptionListCommand {
    buttonTranslationString = 'artemisApp.programmingExercise.problemStatement.exerciseHintCommand';

    protected getValueMeta(): string {
        return 'exerciseHint';
    }

    /**
     * @function getOpeningIdentifier
     * @desc identify the start of the task
     */
    getOpeningIdentifier(): string {
        return '{';
    }

    /**
     * @function getClosingIdentifier
     * @desc identify the end of the explanation
     */
    getClosingIdentifier(): string {
        return '}';
    }
}
