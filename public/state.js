export const KEY = 'playground.frontend.v1';
export function initialState() {
  return {version:1, user:{name:'playground_demo',email:'demo@example.test',phone:''},signedIn:true,balance:1250000,favorites:[],transactions:[],activity:[],claimed:[],locale:'id',messages:[{id:'welcome',title:'Selamat datang di Playground',text:'Template frontend Anda siap dijelajahi. Semua saldo, transaksi dan bonus di sini adalah data demo.',read:false},{id:'preview',title:'Pratinjau frontend aktif',text:'Katalog, navigasi dan workflow member dapat dicoba. Koneksi ke admin Playground akan ditambahkan pada tahap integrasi.',read:false}]};
}
export function hydrateState(value) {
  const base=initialState();
  if(!value || value.version!==1) return base;
  return {...base,...value,balance:Number.isSafeInteger(value.balance)&&value.balance>=0?value.balance:base.balance,favorites:Array.isArray(value.favorites)?value.favorites:[],transactions:Array.isArray(value.transactions)?value.transactions:[],activity:Array.isArray(value.activity)?value.activity:[],claimed:Array.isArray(value.claimed)?value.claimed:[],messages:Array.isArray(value.messages)?value.messages:base.messages};
}
export function amountValue(raw){
  const value=Number(raw);
  if(!Number.isSafeInteger(value)||value<10000||value>10000000) throw new Error('Nominal harus Rp 10.000–Rp 10.000.000, tanpa desimal.');
  return value;
}
export function createTransaction(state,{type,amount,method,id,now}){
  amount=amountValue(amount);
  if(!state.signedIn)throw new Error('Masuk ke akun demo terlebih dahulu.');
  if(!['deposit','withdraw'].includes(type))throw new Error('Jenis transaksi tidak valid.');
  if(state.transactions.some(x=>x.id===id))return state;
  if(type==='withdraw'&&amount>state.balance)throw new Error('Saldo demo tidak mencukupi.');
  const tx={id,type,amount,method,status:'pending',createdAt:now};
  return {...state,balance:state.balance-(type==='withdraw'?amount:0),transactions:[tx,...state.transactions]};
}
export function settleTransaction(state,id,status){
  if(!['completed','cancelled'].includes(status))throw new Error('Status tidak valid.');
  const tx=state.transactions.find(x=>x.id===id);
  if(!tx)throw new Error('Transaksi tidak ditemukan.');
  if(tx.status!=='pending')return state;
  let delta=0;
  if(tx.type==='deposit'&&status==='completed')delta=tx.amount;
  if(tx.type==='withdraw'&&status==='cancelled')delta=tx.amount;
  return {...state,balance:state.balance+delta,transactions:state.transactions.map(x=>x.id===id?{...x,status}:x)};
}
export function claimBonus(state,id,amount){
  if(!state.signedIn)throw new Error('Masuk ke akun demo terlebih dahulu.');
  if(state.claimed.includes(id))throw new Error('Bonus demo ini sudah diklaim.');
  if(!Number.isSafeInteger(amount)||amount<=0)throw new Error('Bonus tidak valid.');
  return {...state,balance:state.balance+amount,claimed:[...state.claimed,id]};
}
export function toggleFavorite(state,id){return {...state,favorites:state.favorites.includes(id)?state.favorites.filter(x=>x!==id):[...state.favorites,id]};}
