PGDMP  1                    }            odbDiplomProject    17.2    17.2     8           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            9           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            :           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            ;           1262    18787    odbDiplomProject    DATABASE     �   CREATE DATABASE "odbDiplomProject" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Russian_Russia.1252';
 "   DROP DATABASE "odbDiplomProject";
                     postgres    false            '          0    18977    __EFMigrationsHistory 
   TABLE DATA           R   COPY public."__EFMigrationsHistory" ("MigrationId", "ProductVersion") FROM stdin;
    public               postgres    false    217   �       3          0    19027 	   agepeople 
   TABLE DATA           6   COPY public.agepeople (idagepeople, type) FROM stdin;
    public               postgres    false    229          /          0    19013    category 
   TABLE DATA           4   COPY public.category (idcategory, type) FROM stdin;
    public               postgres    false    225   /       5          0    19034    course 
   TABLE DATA           �   COPY public.course (idcourse, title, description, fileicon, filecourse, price, idusername, idmonetizationcourse, idcategory, idlevelknowledge, idagepeople) FROM stdin;
    public               postgres    false    231   w       1          0    19020    levelknowledge 
   TABLE DATA           @   COPY public.levelknowledge (idlevelknowledge, type) FROM stdin;
    public               postgres    false    227   '       -          0    19006    monetizationcourse 
   TABLE DATA           H   COPY public.monetizationcourse (idmonetizationcourse, type) FROM stdin;
    public               postgres    false    223   �       )          0    18983    role 
   TABLE DATA           -   COPY public.role (idrole, title) FROM stdin;
    public               postgres    false    219   �       +          0    18992    username 
   TABLE DATA           W   COPY public.username (idusername, dateaddaccount, login, password, idrole) FROM stdin;
    public               postgres    false    221          C           0    0    agepeople_idagepeople_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public.agepeople_idagepeople_seq', 3, true);
          public               postgres    false    228            D           0    0    category_idcategory_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.category_idcategory_seq', 2, true);
          public               postgres    false    224            E           0    0    course_idcourse_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.course_idcourse_seq', 1, true);
          public               postgres    false    230            F           0    0 #   levelknowledge_idlevelknowledge_seq    SEQUENCE SET     Q   SELECT pg_catalog.setval('public.levelknowledge_idlevelknowledge_seq', 3, true);
          public               postgres    false    226            G           0    0 +   monetizationcourse_idmonetizationcourse_seq    SEQUENCE SET     Y   SELECT pg_catalog.setval('public.monetizationcourse_idmonetizationcourse_seq', 2, true);
          public               postgres    false    222            H           0    0    role_idrole_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.role_idrole_seq', 2, true);
          public               postgres    false    218            I           0    0    username_idusername_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.username_idusername_seq', 2, true);
          public               postgres    false    220            '      x������ � �      3      x�3�44�2�4��2�42������  v�      /   8   x�3�0�bÅ}6�� �0���[��8/L2�v^������ �2!�      5   �   x�5���0E��^ �.s/��p@����J�Ҧ+|o�
r�����/���E�%�C�XA�n��{��\L�z~Vֻ�v����6Z�z�R+�� Z���EI4^���ZO�T�
-z&[I^�$9�%���%�O��*��_�Xc�7�f      1   W   x�3�0���v\���.vY;��8/,��pa�-@a����f w߅M@��{��9/�	\l���b��F��} .������ �c6C      -   ,   x�3�0��֋��_�}a�Ŧ{/v_��e�ya>�@� �3      )   B   x�3�0�{.츰����.6\�p��¾�\F��_�wa�Şہ�&��V�+F��� ��%�      +   �  x�M�I��@  е^�t���L*����2��%���^�;�c7����5��L��]�)ڦ�̘S<��u�OU5#��>�>�츛�l��}&�6��� ��2���ga>bzEM��%֋L2�w��UW�Ϥ�žJ�Ҳ�N��ݯ8h#��"X�/�D�.�ϗ��"�>Ⱦ^(9l�>��Z������%{�`'2E���1/JbLj�����(����Q�,��P��xl02�Ǳ��-c�+���^��p؀-��f�}�a�;f��
��Ob"#W/���
o�.��x���cP&gu���Z��%���CW���o��V�,bhq�)�3�F� �ݿ�$�fkw��T���^����|�7o)?�%֛8z����մG|)�V��ZYK/^�����'�6[��1pe":ς��1[i�r�K�7���� 5�؟ɚ��L!�ZxJ��r8΂��� ��7�_ϟ����/���7     