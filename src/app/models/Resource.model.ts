import {IModelDatabase, IModelFilter, IModelStatus} from "../interfaces/IModel.model";
import {config} from "../config/config";
import PouchDB from "pouchdb";
import plugin from "pouchdb-find";
import {IKeyValue} from "../interfaces/IKeyValue.model";

PouchDB.plugin(plugin);


export class ResourceModelApi {
  error: string | null;
  size: number;
  type: string;
  filename: string;
  state: string;
  mime: string;
  ext: string | null;
  url: string;
  updated_at: string;
  created_at: string;
  error_state: string | null;
  original_filename: string;

  constructor(error: string | null, size: number, type: string, filename: string, state: string, mime: string,
              ext: string | null, url: string, updated_at: string, created_at: string, error_state: string | null,
    original_filename: string
  ) {
    this.error = error;
    this.size = size;
    this.type = type;
    this.filename = filename;
    this.state = state;
    this.mime = mime;
    this.ext = ext;
    this.url = url;
    this.updated_at = updated_at;
    this.created_at = created_at;
    this.error_state = error_state;
    this.original_filename = original_filename;
  }
}

export class Resource {
  _id: string = "";
  user_id: string = "";
  file_original_name: string = "";
  original_filename: string = "";
  file_extension: string = "";
  file_header_status: boolean = true;
  file_data_status: boolean = true;
  file_type: string = "";
  file_url: string = "";
  validated: boolean = true;
  deleted: boolean = false;
  createdDate = Date.now();
  modifiedDate: Date | null = null;

  MStatus: IModelStatus = {
    ms_processing:false,
    ms_action_result: false
  }

  MFilter: IModelFilter = {
    mf_search: "",
    mf_tag: ""
  }

  MDatabase: IModelDatabase = {
    md_database: config.COUCHDB_ALCHEMY + "/resource_data"
  }

  updateModifiedDate() {
    return this.modifiedDate = new Date();
  }
  constructor() {
  }


  parseInstance(doc: any){
    this._id = doc['_id']
    this.user_id = doc['user_id']
    this.file_original_name = doc['file_original_name']
    this.file_extension = doc['file_extension']
    this.file_header_status = doc['file_header_status']
    this.file_data_status = doc['file_data_status']
    this.file_type = doc['file_type']
    this.file_url = doc['file_url']
    this.validated = doc['validated']
    this.createdDate = doc['createdDate']
    this.modifiedDate = doc['modifiedDate']
    this.deleted = doc['deleted']

    return this;
  }

  parseComposites(rows: any){
    let CompositeSurveillanceData :Resource[] = [];


    rows.forEach((row: any) => {
      let UserTemp = new Resource();
      CompositeSurveillanceData.push(UserTemp.parseInstance(row))
    });

    return CompositeSurveillanceData;
  }

  parseComposite(rows: any){
    let CompositeSurveillanceData :Resource[] = [];

    if (Array.isArray(rows)) {
      rows.forEach((row: any) => {
        let UserTemp = new Resource();
        CompositeSurveillanceData.push(UserTemp.parseInstance(row));
      });
    } else {
      let UserTemp = new Resource();
      CompositeSurveillanceData.push(UserTemp.parseInstance(rows));
    }

    return CompositeSurveillanceData;
  }

  mapInstance(_rev: string){
    let doc: IKeyValue = {
      "_id": this._id,
      "user_id": this.user_id,
      "file_original_name": this.file_original_name,
      "file_extension": this.file_extension,
      "file_header_status": this.file_header_status,
      "file_data_status": this.file_data_status,
      "file_type": this.file_type,
      "file_url": this.file_url,
      "validated": this.validated,
      "deleted": this.deleted,
      "createdDate": this.createdDate,
      "modifiedDate": this.modifiedDate,
    }

    if(_rev != "") {
      doc['_rev'] = _rev;
    }

    return doc;
  }

  putInstance(response: any, error: any){
    this.MStatus.ms_processing = true;
    let _rev: string = "";

    let db = new PouchDB(this.MDatabase.md_database);

    this.acquireInstance((doc: any) => {
      _rev = doc["_rev"];
    }, null, () => {
      db.put(this.mapInstance(_rev))
        .then(res => {
          this.MStatus.ms_action_result = true;
          response(res);

        }).catch((err: any) => {

        error(err);
      }).finally(() => {
        console.log("s->", this.mapInstance(_rev))
        this.MStatus.ms_processing = false;
      });
    });
  }

  async acquireInstance(success: any, error: any, finished: any = null){
    let db = new PouchDB(this.MDatabase.md_database)
    db.get(this._id)
      .then(function (doc){
        success(doc)
      }).catch(function (err){
      error(err)
    }).finally(() =>{
      if (finished) finished();
    });
  }


  async acquireComposite(success: any, error: any) {
    let remote_db = new PouchDB(this.MDatabase.md_database);
    let instance = this;
    let Surveillance: Resource[] = [];

    remote_db.createIndex({
      index: {
        fields: ['file_original_name']
      }
    }).then((res: any) => {
      remote_db.find({
        selector: {
          'file_original_name': { $regex: ".*" + this.MFilter.mf_search + ".*" },
          'deleted': false
        },
        sort: [{ 'file_original_name': 'asc' }]
      }).then(res => {

        console.log("res", res.docs)
        Surveillance = instance.parseComposite(res.docs);
        success(Surveillance);
      }).catch(err => {
        error(err);
      });
    });
  }

}
