import { Component, OnInit } from '@angular/core';
import { ContatoService } from '../contato.service';
import { Contato } from './contato';

import  { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog'
import { ContatoDetalheComponent } from '../contato-detalhe/contato-detalhe.component'
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-contato',
  templateUrl: './contato.component.html',
  styleUrls: ['./contato.component.css']
})
export class ContatoComponent implements OnInit{
  formulario : FormGroup;
  contatos : Contato[] = [];
  colunas = ['foto' ,'id', 'nome', 'email', 'favorito'];
  totalElementos = 0;
  pagina =0;
  tamanho = 5;
  pageSizeOptions : number[] = [5];
  constructor(
    private service : ContatoService,
    private fb : FormBuilder,
    private dialog : MatDialog,
    private snackbar : MatSnackBar
  ){}
  ngOnInit(): void {
    this.montarformulario();
    this.listarContatos(this.pagina, this.tamanho);
  }

  favoritar(contato : Contato){
    this.service.favourite(contato).subscribe(response =>{
      contato.favorito = !contato.favorito;
    })
    
  }
  montarformulario(){
    this.formulario = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required ,Validators.email,]]

    })
  }

  listarContatos(pagina: number = 0 ,tamanho: number = 5){
    this.service.list(pagina, tamanho).subscribe(response =>{
      this.contatos = response.content;
      this.totalElementos = response.totalElements;
      this.pagina = response.number;
    })
  }

  submit(){
    /*
    const erroNomeRequired = this.formulario.get('nome')?.errors?.['required'];
    console.log('erroNomeRequired', erroNomeRequired)
    const erroEmailRequired = this.formulario.get('email')?.errors?.['required'];
    console.log('erroEmailRequired', erroEmailRequired)
    const erroEmailInvalido = this.formulario.get('email')?.errors?.['email'];
    console.log('erroEmailInvalido', erroEmailInvalido)
    const isValid = this.formulario.valid;
    console.log('is valid ', isValid);
    */
    const formValue = this.formulario.value;
    const contato : Contato= new  Contato(formValue.nome, formValue.email);
    this.service.save(contato).subscribe(response => {
//      let lista :  Contato[] =[... this.contatos, response];
//      this.contatos = lista;
        this.listarContatos();
        this.snackbar.open('Contato foi adicionado', 'Sucesso',{
        duration: 2000
      })
      this.formulario.reset();
    })
    
  }

  uploadFoto(event : any, contato : Contato){
    const file = event.target.files;
    if(file){
      const foto = file[0];
      const formData: FormData = new FormData();
      formData.append("foto", foto);
      this.service.upload(contato, formData).subscribe(response =>  this.listarContatos(this.pagina, this.tamanho))
    }
  }
  visualizarContato(contato: Contato){
    this.dialog.open(ContatoDetalheComponent,{
      width:'400px',
      height: '450',
      data: contato
    })
  }

  paginar(event: PageEvent){
    this.pagina =event.pageIndex;
    this.listarContatos(this.pagina, this.tamanho);
  }
}
