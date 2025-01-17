import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { UsagerLight } from "../../../../../../_common/model";
import {
  InteractionIn,
  InteractionInForm,
} from "../../../../../../_common/model/interaction";
import { INTERACTIONS_IN_AVAILABLE } from "../../../../../../_common/model/interaction/constants";
import { bounce } from "../../../../../shared";
import { UsagerService } from "../../../../usagers/services/usager.service";
import { UsagerFormModel } from "../../../interfaces";
import { InteractionService } from "../../../services/interaction.service";

@Component({
  animations: [bounce],
  selector: "app-set-interaction-in-form",
  templateUrl: "./set-interaction-in-form.component.html",
  styleUrls: ["./set-interaction-in-form.component.css", "../interactions.css"],
})
export class SetInteractionInFormComponent implements OnInit {
  @Input() public usager: UsagerFormModel;

  @Output()
  public cancelReception = new EventEmitter<void>();

  @Output()
  public updateInteractions = new EventEmitter<void>();

  @Output()
  public usagerChange = new EventEmitter<UsagerFormModel>();

  public interactionFormData: InteractionInForm;

  public content: string;
  public loading = false;

  constructor(
    private interactionService: InteractionService,
    private usagerService: UsagerService,
    private notifService: ToastrService
  ) {
    this.interactionFormData = {
      courrierIn: {
        nbCourrier: 0,
        content: null,
      },
      recommandeIn: {
        nbCourrier: 0,
        content: null,
      },
      colisIn: {
        nbCourrier: 0,
        content: null,
      },
    };
    this.content = null;
  }

  public ngOnInit(): void {}

  public setInteractionForm(): void {
    const interactionsToSave = INTERACTIONS_IN_AVAILABLE.reduce(
      (filtered, interaction) => {
        if (this.interactionFormData[interaction].nbCourrier > 0) {
          filtered.push({
            nbCourrier: this.interactionFormData[interaction].nbCourrier,
            type: interaction,
            content: this.content,
          });
        }
        return filtered;
      },
      []
    );

    if (interactionsToSave.length === 0) {
      this.cancelReception.emit();
      return;
    }

    this.loading = true;

    this.interactionService
      .setInteraction(this.usager.ref, interactionsToSave)
      .subscribe({
        next: () => {
          this.notifService.success("Réception enregistrée avec succès");
          this.refreshUsager();
        },
        error: () => {
          this.notifService.error("Impossible d'enregistrer cette interaction");
          this.loading = false;
        },
      });
  }

  // Actualiser les données de l'usager
  public refreshUsager(): void {
    this.usagerService
      .findOne(this.usager.ref)
      .subscribe((usager: UsagerLight) => {
        this.usagerChange.emit(new UsagerFormModel(usager));
        this.cancelReception.emit();
        this.updateInteractions.emit();
      });
  }

  public increment(value: InteractionIn): void {
    this.interactionFormData[value].nbCourrier = this.interactionFormData[
      value
    ].nbCourrier = this.interactionFormData[value].nbCourrier + 1;
  }

  public decrement(value: InteractionIn): void {
    this.interactionFormData[value].nbCourrier = this.interactionFormData[
      value
    ].nbCourrier = this.interactionFormData[value].nbCourrier - 1;
  }

  @HostListener("document:keypress", ["$event"])
  keyEvent(event: KeyboardEvent): void {
    if (event.key === "Enter") {
      event.preventDefault();
      this.setInteractionForm();
    }
  }
}
