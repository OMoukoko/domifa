import { Component, Input, OnInit } from "@angular/core";

import { Router } from "@angular/router";

import { AuthService } from "src/app/modules/shared/services/auth.service";
import { Usager } from "../../interfaces/usager";
import { DocumentService } from "../../services/document.service";

import { Doc } from "../../interfaces/doc";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-documents",
  styleUrls: ["./documents.component.css"],
  templateUrl: "./documents.component.html",
})
export class DocumentsComponent implements OnInit {
  public documents: Doc[];

  @Input() public usager!: Usager;

  constructor(
    private documentService: DocumentService,
    public authService: AuthService,
    private notifService: ToastrService,
    private router: Router
  ) {
    this.documents = [];
  }

  public ngOnInit() {}

  public getDocument(i: number) {
    return this.documentService.getDocument(
      this.usager.id,
      i,
      this.usager.docs[i]
    );
  }

  public deleteDocument(i: number): void {
    this.documentService.deleteDocument(this.usager.id, i).subscribe(
      (usager: Usager) => {
        this.usager.docs = new Usager(usager).docs;
      },
      (error: any) => {
        this.notifService.error("Impossible de supprimer le document");
      }
    );
  }
}