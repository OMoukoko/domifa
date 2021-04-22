import { UsagerFormModel } from "./../form/UsagerFormModel";
import { UsagerLight } from "./../../../../../_common/model/usager/UsagerLight.type";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import {
  InteractionIn,
  InteractionInForm,
  INTERACTIONS_AVAILABLE,
} from "../../../../../_common/model/interaction";

import { InteractionService } from "../../services/interaction.service";
import { ToastrService } from "ngx-toastr";
import { forkJoin } from "rxjs";
import { UsagerService } from "../../services/usager.service";

@Component({
  selector: "app-set-interaction-form",
  templateUrl: "./set-interaction-form.component.html",
  styleUrls: ["./set-interaction-form.component.css"],
})
export class SetInteractionFormComponent implements OnInit {
  @Input() public usager: UsagerFormModel;

  @Output()
  public cancelReception = new EventEmitter<void>();

  @Output()
  public usagerChange = new EventEmitter<UsagerFormModel>();

  public interactionFormData: InteractionInForm;

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
  }

  public ngOnInit(): void {}

  // Ajout de courrier / colis / recommandé entrant
  public setInteractionIn(usager: UsagerFormModel) {
    this.interactionService
      .setInteractionIN(usager, this.interactionFormData)
      .subscribe(
        (response: UsagerLight) => {
          usager = new UsagerFormModel(response);

          // this.notifService.success(interactionsLabels[type]);
        },
        (error) => {
          this.notifService.error("Impossible d'enregistrer cette interaction");
        }
      );
  }

  public setInteractionForm() {
    const interactionsToSave = INTERACTIONS_AVAILABLE.reduce(
      (filtered, interaction) => {
        if (this.interactionFormData[interaction].nbCourrier) {
          filtered.push(
            this.interactionService.setInteraction(this.usager, {
              content: this.interactionFormData[interaction].content,
              nbCourrier: this.interactionFormData[interaction].nbCourrier,
              type: interaction,
            })
          );
        }
        return filtered;
      },
      []
    );

    const joined$ = forkJoin(interactionsToSave);

    joined$.subscribe(
      (values: any) => {
        console.log(values);
        console.log("AVANT USAGER");
        console.log(this.usager.lastInteraction);
        this.refreshUsager();
      },
      (error: any) => {
        console.log(error);
        this.notifService.error("Impossible d'enregistrer cette interaction");
      }
    );
  }

  // Actualiser les données de l'usager
  public refreshUsager() {
    this.usagerService
      .findOne(this.usager.ref)
      .subscribe((usager: UsagerLight) => {
        this.usagerChange.emit(new UsagerFormModel(usager));
        this.cancelReception.emit();
      });
  }

  public increment(value: InteractionIn) {
    this.interactionFormData[value].nbCourrier = this.interactionFormData[
      value
    ].nbCourrier = this.interactionFormData[value].nbCourrier + 1;
  }

  public decrement(value: InteractionIn) {
    this.interactionFormData[value].nbCourrier = this.interactionFormData[
      value
    ].nbCourrier = this.interactionFormData[value].nbCourrier - 1;
  }
}
