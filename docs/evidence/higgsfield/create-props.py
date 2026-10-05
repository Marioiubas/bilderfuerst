import bpy, math, json
from mathutils import Vector
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.engine='BLENDER_EEVEE'
scene.render.fps=24
scene.frame_start=1
scene.frame_end=60
scene.eevee.taa_render_samples=8
scene.render.resolution_x=480
scene.render.resolution_y=360
scene.render.resolution_percentage=100
scene.render.film_transparent=True
scene.render.image_settings.media_type='IMAGE'
scene.render.image_settings.file_format='PNG'
scene.world=bpy.data.worlds.new('Optical studio ambient')
scene.world.color=(0.08,0.08,0.08)
def material(name, color, metal=0, rough=.45):
 m=bpy.data.materials.new(name);m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF')
 p.inputs['Base Color'].default_value=(*color,1)
 p.inputs['Metallic'].default_value=metal
 p.inputs['Roughness'].default_value=rough
 return m
graphite=material('Graphite polymer',(0.035,.045,.05),.25)
silver=material('Brushed silver',(.48,.55,.58),.72,.3)
red=material('Safelight red',(.62,.025,.02),.1)
cyan=material('Scanner cyan',(.08,.55,.58),.3)
amber=material('Negative amber',(.57,.3,.045),.2)
paper=material('Print paper',(.85,.86,.85),0,.8)
dark=material('Optical black',(.008,.012,.017),.4,.22)
roots=[]
def root(name,loc):
 o=bpy.data.objects.new(name,None);scene.collection.objects.link(o);o.location=loc;roots.append(o);return o
def mesh(name,verts,faces,mat,parent):
 m=bpy.data.meshes.new(name);m.from_pydata(verts,[],faces);m.update()
 o=bpy.data.objects.new(name,m);scene.collection.objects.link(o);o.data.materials.append(mat);o.parent=parent;return o
def cube(name,loc,size,mat,parent,bevel=.002):
 bpy.ops.mesh.primitive_cube_add(size=1,location=(0,0,0))
 o=bpy.context.object;o.name=name;o.parent=parent;o.location=loc;o.scale=size
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 o.data.materials.append(mat)
 if bevel:
  mod=o.modifiers.new('Edge radius','BEVEL');mod.width=bevel;mod.segments=2
  o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
 return o
def annulus(name,outer,inner,z,depth,mat,parent,n=48):
 v=[];f=[]
 for height in [z-depth/2,z+depth/2]:
  for radius in [outer,inner]:
   v.extend([(math.cos(i*2*math.pi/n)*radius,math.sin(i*2*math.pi/n)*radius,height) for i in range(n)])
 for i in range(n):
  j=(i+1)%n
  f.extend([(i,j,2*n+j,2*n+i),(n+i,3*n+i,3*n+j,n+j),(2*n+i,2*n+j,3*n+j,3*n+i),(i,n+i,n+j,j)])
 return mesh(name,v,f,mat,parent)
def cylinder(name,radius,depth,z,mat,parent,xy=(0,0)):
 bpy.ops.mesh.primitive_cylinder_add(vertices=40,radius=radius,depth=depth)
 o=bpy.context.object;o.name=name;o.parent=parent;o.location=(xy[0],xy[1],z);o.data.materials.append(mat)
 for p in o.data.polygons:p.use_smooth=True
 return o
ap=root('Aperture',(-.4,.16,.06))
annulus('Aperture housing',.142,.105,.02,.035,graphite,ap)
annulus('Optical silver rim',.146,.138,.041,.007,silver,ap)
annulus('Inner lens ring',.108,.093,.045,.009,silver,ap)
for i in range(8):
 a=i*math.tau/8
 pts=[(.03,0,.03),(.105,0,.03),(.085,.063,.03),(.021,.027,.03)]
 blade=mesh('Aperture blade %02d'%i,pts,[(0,1,2,3)],silver if i%2==0 else graphite,ap)
 blade.rotation_euler.z=a;blade.keyframe_insert(data_path='rotation_euler',frame=1)
 blade.rotation_euler.z=a+.17;blade.keyframe_insert(data_path='rotation_euler',frame=30)
 blade.rotation_euler.z=a;blade.keyframe_insert(data_path='rotation_euler',frame=60)
 for k in range(2):
  t=a+k*.18
  tick=cube('Lens registration',(.126*math.cos(t),.126*math.sin(t),.044),(.015,.0015,.002),red if i==0 else silver,ap,.0005);tick.rotation_euler.z=t
reel=root('Reel',(0,.16,.03))
for z in [.007,.046]:
 annulus('Reel flange',.138,.113,z,.008,silver,reel)
 annulus('Reel hub',.048,.019,z,.008,silver,reel)
 for i in range(6):
  a=i*math.tau/6
  spoke=cube('Reel spoke',(math.cos(a)*.082,math.sin(a)*.082,z),(.072,.022,.008),silver,reel)
  spoke.rotation_euler.z=a
annulus('Wound film',.106,.048,.026,.029,graphite,reel)
annulus('Film edge',.106,.098,.042,.002,amber,reel)
cass=root('Cassette',(.4,.16,.035))
cube('Cassette shell',(0,0,0),(.278,.178,.029),graphite,cass,.006)
cube('Cassette label',(0,.047,.016),(.225,.038,.002),paper,cass,.001)
for x in [-.071,.071]:
 cylinder('Audio reel',.042,.004,.017,silver,cass,(x,-.022))
 cylinder('Audio reel hub',.013,.006,.02,dark,cass,(x,-.022))
annulus('Cassette centre marking',.012,.008,.022,.003,red,cass)
vhs=root('VHS',(-.4,-.2,.035))
cube('Video cassette shell',(0,0,0),(.32,.192,.038),graphite,vhs,.005)
cube('Video label',(0,.055,.021),(.19,.045,.002),paper,vhs,.001)
for x in [-.093,.093]:
 cylinder('VHS reel window',.042,.005,.023,silver,vhs,(x,-.015))
 cylinder('VHS reel dark centre',.014,.006,.026,dark,vhs,(x,-.015))
cube('Video format mark',(.113,.057,.023),(.032,.005,.002),cyan,vhs,.0005)
negative=root('Negative',(0,-.2,.03))
cube('Negative border',(0,0,0),(.32,.21,.008),amber,negative,.001)
for x in [-.084,0,.084]:
 for y in [-.046,.046]:
  cube('Empty negative frame',(x,y,.006),(.071,.077,.002),dark,negative,.0005)
for i in range(13):
 for y in [-.096,.096]:
  cube('Film perforation',(-.143+i*.024,y,.006),(.009,.006,.002),paper,negative,.0003)
prints=root('Prints',(.4,-.2,.033))
for i in range(3):
 o=cube('Print sheet %d'%i,(i*.011,i*.014,i*.007),(.26,.2,.002),paper,prints,.0005);o.rotation_euler.z=(i-1)*.05
cube('Print mount',(0,.012,.021),(.225,.162,.001),graphite,prints,.0005)
cube('Print border registration',(0,-.086,.024),(.06,.0015,.001),red,prints,.0002)
# Delivery lighting is deliberate studio light, not a business equipment claim.
def light(name,kind,location,energy,color):
 data=bpy.data.lights.new(name,kind);data.energy=energy;data.color=color
 o=bpy.data.objects.new(name,data);scene.collection.objects.link(o);o.location=location
 o.rotation_euler=(Vector((0,0,0))-o.location).to_track_quat('-Z','Y').to_euler()
 if kind=='SPOT':data.spot_size=math.radians(110);data.spot_blend=.65
 return o
light('Key silver','SPOT',(-.6,-.2,1.2),90,(.86,.94,1))
light('Fill warm','POINT',(.6,.5,.6),22,(1,.6,.47))
light('Rim cyan','POINT',(-.2,.7,.7),22,(.25,.8,.86))
bpy.ops.object.camera_add(location=(.62,-1,1.4))
cam=bpy.context.object;cam.name='Delivery Camera';scene.camera=cam
cam.rotation_euler=(Vector((0,0,0))-cam.location).to_track_quat('-Z','Y').to_euler()
cam.data.type='ORTHO';cam.data.ortho_scale=1.3;cam.data.lens=50
scene.frame_set(1)

result={'objects':len(bpy.data.objects),'props':[r.name for r in roots],'animated':'8 aperture blades; 60 frame open and close','frames':[1,30,60],'scale':'metres'}
