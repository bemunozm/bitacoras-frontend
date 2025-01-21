import { BrowserRouter, Routes, Route} from 'react-router-dom'
import DashboardView from './views/DashboardView'
import LoginView from './views/auth/LoginView'
import AppLayout from './layouts/AppLayout'
import AuthLayout from './layouts/AuthLayout'
import ConfirmAccountView from './views/auth/ConfirmAccountView'
import ForgotPasswordView from './views/auth/ForgotPasswordView'
import NewPasswordView from './views/auth/NewPasswordView'
import RequestNewCodeView from './views/auth/RequestNewCodeView'
import RolesView from './views/roles/RolesView'
import UsersView from './views/users/UsersView'
import ResidencesView from './views/residences/ResidencesView'
import CategoriesView from './views/categories/CategoriesView'
import ProgramsView from './views/programs/ProgramsView'
import BitacorasView from './views/bitacoras/BitacorasView'
import BitacoraDetailsView from './views/bitacoras/BitacoraDetailsView'
import ActivityDetailsView from './views/activities/ActivityDetailsView'
import Informe from './components/pdfs/Informe'
import EditProfileView from './views/profile/EditProfileView'
import UnauthorizedView from './views/UnauthorizedView'
import ProtectedRoute from './layouts/ProtectedRoute'
import EditActivityDetailsView from './views/activities/EditActivityDetailsView'
import NotFound from './views/NotFound'



export default function Router(){

    return (
        <BrowserRouter>
            <Routes>

                <Route element={<AuthLayout/>}>
                    <Route path='/auth/login' element={<LoginView/>}/>
                    {/* <Route path='/auth/register' element={<RegisterView/>}/> */}
                    <Route path='/auth/confirm-account' element={<ConfirmAccountView/>}/>
                    <Route path='/auth/forgot-password' element={<ForgotPasswordView/>}/>
                    <Route path='/auth/reset-password' element={<NewPasswordView/>}/>
                    <Route path='/auth/request-code' element={<RequestNewCodeView/>}/>
                </Route>


                <Route element={<AppLayout/>}> {/* Se envuelven todas las rutas anidadas en un layout*/}
                
                   {/* 
                        -Se definen las rutas de la aplicación que comparten el layout
                        -En este caso, la ruta raíz renderiza el DashboardView
                        -index = define la ruta raíz
                        -element = componente a renderizar
                        -path = ruta de la aplicación
                    */}
                    <Route path='/' element={<DashboardView/>} index/>


                    {/* Roles */}
                    <Route path='/administracion/roles' element={<ProtectedRoute requiredRoles={['Administrador']}><RolesView/></ProtectedRoute>}/>

                    {/* Usuarios */}
                    <Route path='/administracion/usuarios' element={<ProtectedRoute requiredRoles={['Administrador']}><UsersView/></ProtectedRoute>}/>

                    {/* Residencias */}
                    <Route path='/administracion/residencias' element={<ProtectedRoute requiredRoles={['Administrador']}><ResidencesView/></ProtectedRoute>}/>

                    {/* Categorias */}
                    <Route path='/administracion/categorias' element={<ProtectedRoute requiredRoles={['Administrador']}><CategoriesView/></ProtectedRoute>}/>

                    {/* Programas */}
                    <Route path='/administracion/programas' element={<ProtectedRoute requiredRoles={['Administrador']}><ProgramsView/></ProtectedRoute>}/>

                    {/* Bitácora */}
                    <Route path='/bitacoras' element={<BitacorasView/>}/>
                    <Route path='/bitacoras/:id' element={<BitacoraDetailsView/>}/>

                    {/* Actividades */}
                     <Route path='/actividad/:id' element={<ActivityDetailsView/>}/>
                     <Route path='/actividad/editar/:id' element={<EditActivityDetailsView/>}/>

                    {/* Profile  */}
                    <Route path='/perfil' element={<EditProfileView/>}/>
                </Route>

                <Route path='/informe' element={<Informe/>}/>
                <Route path='/unauthorized' element={<UnauthorizedView/>}/>
                <Route path='*' element={<NotFound/>}/>
            </Routes>
        </BrowserRouter>
    )
}