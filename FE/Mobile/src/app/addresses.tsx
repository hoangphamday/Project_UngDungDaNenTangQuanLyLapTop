import { useCallback, useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { apiRequest } from '@/services/api-client';
import { useApp } from '@/state/app-context';
import { ScreenHeader } from '@/components/ui/screen-header';
import { FormField } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';
import { colors, spacing } from '@/constants/theme';
const empty={nguoiNhan:'',soDienThoai:'',tinhThanh:'',quanHuyen:'',phuongXa:'',diaChiChiTiet:''};
const labels={nguoiNhan:'Người nhận',soDienThoai:'Số điện thoại',tinhThanh:'Tỉnh / thành phố',quanHuyen:'Quận / huyện',phuongXa:'Phường / xã',diaChiChiTiet:'Địa chỉ chi tiết'};
export default function AddressesScreen(){
 const {accessToken}=useApp();const router=useRouter();const [rows,setRows]=useState<Record<string,any>[]>([]);const [form,setForm]=useState(empty);const [editing,setEditing]=useState<number|null>(null);const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 const load=useCallback(async()=>{if(!accessToken)return;try{const res=await apiRequest<{data:Record<string,any>[]}>('/addresses',{token:accessToken});setRows(res.data);}catch(e){setError(e instanceof Error?e.message:'Không thể tải địa chỉ');}},[accessToken]);
 useFocusEffect(useCallback(()=>{void load();},[load]));
 async function save(){if(!accessToken)return;setBusy(true);setError('');try{await apiRequest('/addresses'+(editing?`/${editing}`:''),{token:accessToken,method:editing?'PUT':'POST',body:JSON.stringify({...form,macDinh:rows.length===0})});setForm(empty);setEditing(null);await load();}catch(e){setError(e instanceof Error?e.message:'Không thể lưu địa chỉ');}finally{setBusy(false);}}
 return <View style={styles.page}><ScreenHeader title="Địa chỉ giao hàng"/><ScrollView contentContainerStyle={styles.content}>
 {!accessToken?<Button title="Đăng nhập" onPress={()=>router.push('/auth/login')}/>:<>
 {error&&<Text style={{color:colors.danger}}>{error}</Text>}
 {rows.map(a=><View key={a.id} style={styles.card}><Text>{a.nguoi_nhan} · {a.so_dien_thoai}</Text><Text>{[a.dia_chi_chi_tiet,a.phuong_xa,a.quan_huyen,a.tinh_thanh].join(', ')}</Text><Button title="Sửa địa chỉ" variant="secondary" onPress={()=>{setEditing(a.id);setForm({nguoiNhan:a.nguoi_nhan,soDienThoai:a.so_dien_thoai,tinhThanh:a.tinh_thanh,quanHuyen:a.quan_huyen,phuongXa:a.phuong_xa,diaChiChiTiet:a.dia_chi_chi_tiet});}}/></View>)}
 <Text>{editing?'Chỉnh sửa địa chỉ':'Thêm địa chỉ'}</Text>
 {(Object.keys(empty) as (keyof typeof empty)[]).map(key=><FormField key={key} label={labels[key]} value={form[key]} onChangeText={value=>setForm({...form,[key]:value})}/>)}
 <Button title={busy?'Đang lưu…':'Lưu địa chỉ'} disabled={busy||Object.values(form).some(v=>!v.trim())} onPress={()=>void save()}/>
 </>}
 </ScrollView></View>;
}
const styles=StyleSheet.create({page:{flex:1,backgroundColor:colors.background},content:{padding:spacing.lg,gap:spacing.md},card:{padding:spacing.lg,gap:spacing.sm,backgroundColor:colors.white,borderRadius:12}});
